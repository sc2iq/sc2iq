targetScope = 'subscription'

param environmentName string
param location string

param sharedResourceGroupName string
param sharedContainerAppsEnvironmentName string
param sharedAcrName string

param resourceGroupName string

resource sharedRg 'Microsoft.Resources/resourceGroups@2025-04-01' existing = {
  name: sharedResourceGroupName
}

resource sharedContainerAppsEnv 'Microsoft.App/managedEnvironments@2025-02-02-preview' existing = {
  name: sharedContainerAppsEnvironmentName
  scope: sharedRg
}

resource sharedAcr 'Microsoft.ContainerRegistry/registries@2025-05-01-preview' existing = {
  name: sharedAcrName
  scope: sharedRg
}

var uniqueRgString = take(uniqueString(sharedRg.id), 6)

module sqlDatabase 'modules/sqlDatabase.bicep' = {
  name: 'sqlDatabaseModule'
  scope: sharedRg
  params: {
    uniqueRgString: uniqueRgString
  }
}

module storageBlobContainers 'modules/storageBlobContainers.bicep' = {
  name: 'storageBlobContainersModule'
  scope: sharedRg
  params: {
    uniqueRgString: uniqueRgString
  }
}

var tags = {
  'azd-env-name': '${resourceGroupName}-${environmentName}'
  project: resourceGroupName
}

resource rg 'Microsoft.Resources/resourceGroups@2025-04-01' = {
  name: resourceGroupName
  location: location
  tags: tags
}

var defaultImageName = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'

param clientContainerAppName string = '${resourceGroupName}-client'
param clientContainerAppImageName string = ''

param clerkPublishableKey string
@secure()
param clerkSecretKey string
@secure()
param databaseUrl string
@secure()
param cookieSecret string

module clientContainerApp 'modules/clientContainerApp.bicep' = {
  name: 'clientContainerAppModule'
  scope: rg
  params: {
    name: clientContainerAppName
    location: location
    tags: union(tags, { 'azd-service-name': 'client' })
    imageName: !empty(clientContainerAppImageName) ? clientContainerAppImageName : defaultImageName
    managedEnvironmentResourceId: sharedContainerAppsEnv.id
    containerName: clientContainerAppName
    registryUsername: sharedAcr.name
    registryPassword: sharedAcr.listCredentials().passwords[0].value
    clerkPublishableKey: clerkPublishableKey
    clerkSecretKey: clerkSecretKey
    databaseUrl: databaseUrl
    cookieSecret: cookieSecret
  }
}


param qnaContainerAppName string = '${resourceGroupName}-qna'
param qnaContainerAppImageName string = ''

@secure()
param storageConnectionStringSecret string
param storageContainerNameAudioClips string

module qnaContainerApp 'modules/questionAnswerContainerApp.bicep' = {
  name: 'qnaContainerAppModule'
  scope: rg
  params: {
    name: qnaContainerAppName
    location: location
    tags: union(tags, { 'azd-service-name': 'question-answer' })
    imageName: !empty(qnaContainerAppImageName) ? qnaContainerAppImageName : defaultImageName
    managedEnvironmentResourceId: sharedContainerAppsEnv.id
    containerName: qnaContainerAppName
    registryUsername: sharedAcr.name
    registryPassword: sharedAcr.listCredentials().passwords[0].value
    storageConnectionString: storageConnectionStringSecret
    storageContainerName: storageContainerNameAudioClips
  }
}
