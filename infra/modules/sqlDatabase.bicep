param uniqueRgString string

// global	1-63	Lowercase letters, numbers, and hyphens.
// https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/resource-name-rules#microsoftsql
@minLength(1)
@maxLength(63)
param serverName string = '${resourceGroup().name}-${uniqueRgString}-sql-server'

param projectName string = 'sc2iq'

@minLength(1)
@maxLength(128)
param dbName string = '${resourceGroup().name}-${uniqueRgString}-sql-db-${projectName}'

param location string = resourceGroup().location

resource sqlServer 'Microsoft.Sql/servers@2024-11-01-preview' existing = {
  name: serverName
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2024-11-01-preview' = {
  parent: sqlServer
  location: location
  name: dbName
  properties: {
    autoPauseDelay: 60
    minCapacity: any('0.5')
    maxSizeBytes: int('5368709120')
  }
  sku: {
    name: 'GP_S_Gen5_1'
  }
}
