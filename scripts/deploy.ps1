Param([switch]$WhatIf = $True)

echo "PScriptRoot: $PScriptRoot"
$repoRoot = If ('' -eq $PScriptRoot) {
  "$PSScriptRoot/../.."
} Else {
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

Write-Step "Create Resource Group"
az group create -l $resourceGroupLocation -g $sc2iqResourceGroupName --query name -o tsv

$envFilePath = $(Resolve-Path "$repoRoot/.env").Path

Write-Step "Get ENV Vars from: $envFilePath"
$auth0ReturnToUrl = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'AUTH0_RETURN_TO_URL'
$auth0CallbackUrl = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'AUTH0_CALLBACK_URL'
$auth0ClientId = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'AUTH0_CLIENT_ID'
$auth0ClientSecret = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'AUTH0_CLIENT_SECRET'
$auth0Domain = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'AUTH0_DOMAIN'
$auth0LogoutUrl = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'AUTH0_LOGOUT_URL'
$auth0ManagementClientId = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'AUTH0_MANAGEMENT_APP_CLIENT_ID'
$auth0ManagementClientSecret = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'AUTH0_MANAGEMENT_APP_CLIENT_SECRET'
$cookieSecret = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'COOKIE_SECRET'
$databaseUrlSecret = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'DATABASE_URL'

Write-Step "Fetch params from Azure"
$sharedResourceVars = Get-SharedResourceDeploymentVars $sharedResourceGroupName $sharedRgString

$clientContainerName = "$sc2iqResourceGroupName-client"
$clientImageTag = $(Get-Date -Format "yyyyMMddhhmm")
$clientImageName = "$($sharedResourceVars.registryUrl)/${clientContainerName}:${clientImageTag}"

$data = [ordered]@{
  "auth0ReturnToUrl"            = $auth0ReturnToUrl
  "auth0CallbackUrl"            = $auth0CallbackUrl
  "auth0ClientId"               = $auth0ClientId
  "auth0ClientSecret"           = "$($auth0ClientSecret.Substring(0, 5))..."
  "auth0Domain"                 = $auth0Domain
  "auth0LogoutUrl"              = $auth0LogoutUrl
  "auth0ManagementClientId"     = $auth0ManagementClientId
  "auth0ManagementClientSecret" = "$($auth0ManagementClientSecret.Substring(0, 5))..."

  "cookieSecret"                = "$($cookieSecret.Substring(0, 5))..."
  "databaseUrlSecret"           = "$($databaseUrlSecret.Substring(0, 5))..."

  "clientImageName"             = $clientImageName

  "containerAppsEnvResourceId" = $($sharedResourceVars.containerAppsEnvResourceId)
  "registryUrl"                = $($sharedResourceVars.registryUrl)
  "registryUsername"           = $($sharedResourceVars.registryUsername)
  "registryPassword"           = "$($($sharedResourceVars.registryPassword).Substring(0, 5))..."
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

Write-Step "Provision $sc2iqResourceGroupName Resources (What-If: $($WhatIf))"

Write-Step "Build and Push $clientImageName Image"
az acr build -r $registryUrl -t $clientImageName "$repoRoot/client-remix"

Write-Step "Deploy $clientImageName Container App"
$clientBicepContainerDeploymentFilePath = "$repoRoot/bicep/modules/clientContainerApp.bicep"
$clientFqdn = $(az deployment group create `
    -g $sc2iqResourceGroupName `
    -f $clientBicepContainerDeploymentFilePath `
    -p managedEnvironmentResourceId=$containerAppsEnvResourceId `
    registryUrl=$registryUrl `
    registryUsername=$registryUsername `
    registryPassword=$registryPassword `
    imageName=$clientImageName `
    containerName=$clientContainerName `
    auth0ReturnToUrl=$auth0ReturnToUrl `
    auth0CallbackUrl=$auth0CallbackUrl `
    auth0ClientId=$auth0ClientId `
    auth0ClientSecret=$auth0ClientSecret `
    auth0Domain=$auth0Domain `
    auth0LogoutUrl=$auth0LogoutUrl `
    auth0managementClientId=$auth0managementClientId `
    auth0managementClientSecret=$auth0managementClientSecret `
    databaseUrl=$databaseUrlSecret `
    cookieSecret=$cookieSecret `
    --query "properties.outputs.fqdn.value" `
    -o tsv)

$clientUrl = "https://$clientFqdn"
Write-Output $clientUrl
