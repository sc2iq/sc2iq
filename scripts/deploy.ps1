Param([switch]$WhatIf = $True)

echo "PScriptRoot: $PScriptRoot"
$repoRoot = If ('' -eq $PScriptRoot) {
  "$PSScriptRoot/../.."
}
Else {
  "."
}

echo "Repo Root: $repoRoot"

Import-Module "C:/repos/shared-resources/pipelines/scripts/common.psm1" -Force
Import-Module "$repoRoot/scripts/common.psm1" -Force

$inputs = @{
  "WhatIf" = $WhatIf
}

Write-Hash "Inputs" $inputs

$sharedResourceGroupName = "shared"
$sharedRgString = 'klgoyi'
$resourceGroupLocation = "westus3"
$sc2iqResourceGroupName = "sc2iq"

$sharedResourceNames = Get-ResourceNames $sharedResourceGroupName $sharedRgString
$sc2iqResourceNames = Get-LocalResourceNames $sc2iqResourceGroupName 'unused'

$envFilePath = $(Resolve-Path "$repoRoot/.env").Path

Write-Step "Get ENV Vars from: $envFilePath"
$clerkPublishableKey = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'CLERK_PUBLISHABLE_KEY'
$clerkSecretKey = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'CLERK_SECRET_KEY'
$cookieSecret = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'COOKIE_SECRET'
$databaseUrlSecret = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'DATABASE_URL'

Write-Step "Fetch params from Azure"
$sharedResourceVars = Get-SharedResourceDeploymentVars $sharedResourceGroupName $sharedRgString

$clientContainerName = "$sc2iqResourceGroupName-client"
$clientImageTag = $(Get-Date -Format "yyyyMMddhhmm")
$clientImageName = "$($sharedResourceVars.registryUrl)/${clientContainerName}:${clientImageTag}"

$qnaContainerName = "$sc2iqResourceGroupName-qna"
$qnaImageTag = $(Get-Date -Format "yyyyMMddhhmm")
$qnaImageName = "$($sharedResourceVars.registryUrl)/${qnaContainerName}:${qnaImageTag}"

$secrectCharRevealLength = 10

$data = [ordered]@{
  "cookieSecret"               = "$($cookieSecret.Substring(0, $secrectCharRevealLength))..."
  "databaseUrlSecret"          = "$($databaseUrlSecret.Substring(0, $secrectCharRevealLength))..."
  "clerkPublishableKey"        = $clerkPublishableKey
  "clerkSecretKey"             = "$($clerkSecretKey.Substring(0, $secrectCharRevealLength))..."

  "clientImageName"            = $clientImageName
  "qnaImageName"               = $qnaImageName

  "containerAppsEnvResourceId" = $($sharedResourceVars.containerAppsEnvResourceId)
  "registryUrl"                = $($sharedResourceVars.registryUrl)
  "registryUsername"           = $($sharedResourceVars.registryUsername)
  "registryPassword"           = "$($($sharedResourceVars.registryPassword).Substring(0, $secrectCharRevealLength))..."
}

Write-Hash "Data" $data

Write-Step "Provision Additional $sharedResourceGroupName Resources (What-If: $($WhatIf))"
$mainBicepFile = "$repoRoot/bicep/main.bicep"

if ($WhatIf -eq $True) {
  az deployment group create `
    -g $sharedResourceGroupName `
    -f $mainBicepFile `
    --what-if
}
else {
  az deployment group create `
    -g $sharedResourceGroupName `
    -f $mainBicepFile `
    --query "properties.provisioningState" `
    -o tsv
}

Write-Step "Create Resource Group"
az group create -l $resourceGroupLocation -g $sc2iqResourceGroupName --query name -o tsv

Write-Step "Provision $sc2iqResourceGroupName Resources (What-If: $($WhatIf))"

# Provision Question and Answer Container App
Write-Step "Build $qnaImageName Image (What-If: $($WhatIf))"
docker build -t $qnaImageName "$repoRoot/apps/question-answer"

if ($WhatIf -eq $False) {
  Write-Step "Push $qnaImageName Image (What-If: $($WhatIf))"
  docker push $qnaImageName
}
else {
  Write-Step "Skipping Push $qnaImageName Image (What-If: $($WhatIf))"
}

Write-Step "Get Top Image from $($sharedResourceVars.registryUrl) respository $qnaContainerName to Verify Push (What-If: $($WhatIf))"
az acr repository show-tags --name $($sharedResourceVars.registryUrl) --repository $qnaContainerName --orderby time_desc --top 1 -o tsv

Write-Step "Deploy $qnaImageName Container App (What-If: $($WhatIf))"
$qnaBicepContainerDeploymentFilePath = "$repoRoot/bicep/modules/qnaContainerApp.bicep"

if ($WhatIf -eq $True) {
  az deployment group create `
    -g $sc2iqResourceGroupName `
    -f $qnaBicepContainerDeploymentFilePath `
    -p managedEnvironmentResourceId=$($sharedResourceVars.containerAppsEnvResourceId) `
    registryUrl=$($sharedResourceVars.registryUrl) `
    registryUsername=$($sharedResourceVars.registryUsername) `
    registryPassword=$($sharedResourceVars.registryPassword) `
    imageName=$qnaImageName `
    containerName=$qnaContainerName `
    clerkPublishableKey=$clerkPublishableKey `
    clerkSecretKey=$clerkSecretKey `
    databaseUrl=$databaseUrlSecret `
    cookieSecret=$cookieSecret `
    --what-if
}
else {
  $qnaFqdn = $(az deployment group create `
      -g $sc2iqResourceGroupName `
      -f $qnaBicepContainerDeploymentFilePath `
      -p managedEnvironmentResourceId=$($sharedResourceVars.containerAppsEnvResourceId) `
      registryUrl=$($sharedResourceVars.registryUrl) `
      registryUsername=$($sharedResourceVars.registryUsername) `
      registryPassword=$($sharedResourceVars.registryPassword) `
      imageName=$qnaImageName `
      containerName=$qnaContainerName `
      clerkPublishableKey=$clerkPublishableKey `
      clerkSecretKey=$clerkSecretKey `
      databaseUrl=$databaseUrlSecret `
      cookieSecret=$cookieSecret `
      --query "properties.outputs.fqdn.value" `
      -o tsv)

  $qnaUrl = "https://$qnaFqdn"
  Write-Output $qnaUrl
}

# Provision SC2IQ Container App
Write-Step "Build $clientImageName Image (What-If: $($WhatIf))"
docker build -t $clientImageName "$repoRoot/apps/client-remix"

if ($WhatIf -eq $False) {
  Write-Step "Push $clientImageName Image (What-If: $($WhatIf))"
  docker push $clientImageName
}
else {
  Write-Step "Skipping Push $clientImageName Image (What-If: $($WhatIf))"
}

Write-Step "Get Top Image from $($sharedResourceVars.registryUrl) respository $clientContainerName to Verify Push (What-If: $($WhatIf))"
az acr repository show-tags --name $($sharedResourceVars.registryUrl) --repository $clientContainerName --orderby time_desc --top 1 -o tsv

Write-Step "Deploy $clientImageName Container App (What-If: $($WhatIf))"
$clientBicepContainerDeploymentFilePath = "$repoRoot/bicep/modules/clientContainerApp.bicep"

if ($WhatIf -eq $True) {
  az deployment group create `
    -g $sc2iqResourceGroupName `
    -f $clientBicepContainerDeploymentFilePath `
    -p managedEnvironmentResourceId=$($sharedResourceVars.containerAppsEnvResourceId) `
    registryUrl=$($sharedResourceVars.registryUrl) `
    registryUsername=$($sharedResourceVars.registryUsername) `
    registryPassword=$($sharedResourceVars.registryPassword) `
    imageName=$clientImageName `
    containerName=$clientContainerName `
    clerkPublishableKey=$clerkPublishableKey `
    clerkSecretKey=$clerkSecretKey `
    databaseUrl=$databaseUrlSecret `
    cookieSecret=$cookieSecret `
    --what-if
}
else {
  $clientFqdn = $(az deployment group create `
      -g $sc2iqResourceGroupName `
      -f $clientBicepContainerDeploymentFilePath `
      -p managedEnvironmentResourceId=$($sharedResourceVars.containerAppsEnvResourceId) `
      registryUrl=$($sharedResourceVars.registryUrl) `
      registryUsername=$($sharedResourceVars.registryUsername) `
      registryPassword=$($sharedResourceVars.registryPassword) `
      imageName=$clientImageName `
      containerName=$clientContainerName `
      clerkPublishableKey=$clerkPublishableKey `
      clerkSecretKey=$clerkSecretKey `
      databaseUrl=$databaseUrlSecret `
      cookieSecret=$cookieSecret `
      --query "properties.outputs.fqdn.value" `
      -o tsv)

  $clientUrl = "https://$clientFqdn"
  Write-Output $clientUrl
}
