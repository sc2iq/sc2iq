param name string = '${resourceGroup().name}-qna'
param location string = resourceGroup().location
param tags object = {}

param managedEnvironmentResourceId string

param imageName string
param containerName string

param registryUsername string
@secure()
param registryPassword string

@secure()
param storageConnectionString string
param storageContainerName string

var registryPasswordName = 'container-registry-password'
var storageConnectionStringSecretName = 'azure-storage-connection-string'

resource containerApp 'Microsoft.App/containerApps@2025-02-02-preview' = {
  name: name
  location: location
  tags: tags
  properties: {
    managedEnvironmentId: managedEnvironmentResourceId
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 8080
      }
      registries: [
        {
          server: '${registryUsername}.azurecr.io'
          username: registryUsername
          passwordSecretRef: registryPasswordName
        }
      ]
      secrets: [
        {
          name: registryPasswordName
          value: registryPassword
        }
        {
          name: storageConnectionStringSecretName
          value: storageConnectionString
        }
      ]
    }
    template: {
      containers: [
        {
          image: imageName
          name: containerName
          // https://learn.microsoft.com/en-us/azure/container-apps/containers#configuration
          resources: {
            cpu: any('0.25')
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'AZURE_STORAGE_CONNECTION_STRING'
              secretRef: storageConnectionStringSecretName
            }
            {
              name: 'AZURE_STORAGE_BLOB_CONTAINER_NAME_AUDIO_CLIPS'
              value: storageContainerName
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 1
      }
    }
  }
}

output name string = containerApp.name
output appUrl string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
