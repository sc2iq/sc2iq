$resourceGroupName = "sc2iq"
$resourceGroupLocation = "westus3"

echo "PScriptRoot: $PScriptRoot"
$repoRoot = If ('' -eq $PScriptRoot) {
  "$PSScriptRoot/.."
}
else {
  "."
}

echo "Repo Root: $repoRoot"

Import-Module "C:/repos/shared-resources/pipelines/scripts/common.psm1" -Force

Write-Step "Get ENV Vars from file"
$envFilePath = $(Resolve-Path "$repoRoot/.env").Path
$auth0ReturnToUrl = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'AUTH0_RETURN_TO_URL'
$auth0ReturnToUrl

$imageTag = $(az acr repository show-tags -n $sharedResourceNames.containerRegistry --repository "$sc2iqResourceGroupName-client" --top 1 --orderby time_desc -o tsv)
