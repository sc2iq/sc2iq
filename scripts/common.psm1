
function Get-LocalResourceNames {
    param (
        [Parameter(Mandatory = $true, Position = 0)]
        [string]$resourceGroupName,
        [Parameter(Mandatory = $true, Position = 1)]
        [string]$uniqueRgString
    )

    $resourceNames = [ordered]@{
        storageContainerNameInput = "aml-endpoint-client-input"
        storageContainerNameOutput = "aml-endpoint-client-output"
    }

    return $resourceNames
}
