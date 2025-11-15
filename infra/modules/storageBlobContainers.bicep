param uniqueRgString string

// global	3-24 Alphanumerics.
// https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/resource-name-rules#microsoftstorage
@minLength(3)
@maxLength(24)
param storageAccountName string = '${resourceGroup().name}${uniqueRgString}storage'

resource storageAccount 'Microsoft.Storage/storageAccounts@2025-01-01' existing = {
  name: storageAccountName
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2025-01-01' existing = {
  parent: storageAccount
  name: 'default'
}

resource audioClipsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2025-01-01' = {
  parent: blobService
  name: 'sc2-iq-audioclips'
  properties: {
    publicAccess: 'Blob'
  }
}

resource transcribedAudioClipsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2025-01-01' = {
  parent: blobService
  name: 'sc2-iq-audioclips-transcribed'
  properties: {
    publicAccess: 'Blob'
  }
}
