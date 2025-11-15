var uniqueRgString = take(uniqueString(resourceGroup().id), 6)

module sqlDatabase 'modules/sqlDatabase.bicep' = {
  name: 'sqlDatabaseModule'
  params: {
    uniqueRgString: uniqueRgString
  }
}

module storageBlobContainers 'modules/storageBlobContainers.bicep' = {
  name: 'storageBlobContainersModule'
  params: {
    uniqueRgString: uniqueRgString
  }
}

