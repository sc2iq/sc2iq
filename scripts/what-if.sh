#!/bin/bash

# Load environment variables from azd
source .azure/dev/.env

# Run Azure what-if deployment with detailed output
az deployment sub what-if \
  --location "$AZURE_LOCATION" \
  --template-file ./infra/main.bicep \
  --parameters environmentName="$AZURE_ENV_NAME" \
  --parameters location="$AZURE_LOCATION" \
  --parameters resourceGroupName="$AZURE_RESOURCE_GROUP" \
  --parameters sharedResourceGroupName="$SHARED_RESOURCE_GROUP" \
  --parameters sharedContainerAppsEnvironmentName="$SHARED_CONTAINER_APPS_ENVIRONMENT_NAME" \
  --parameters sharedAcrName="$SHARED_ACR_NAME" \
  --parameters clerkPublishableKey="$CLERK_PUBLISHABLE_KEY" \
  --parameters clerkSecretKey="$CLERK_SECRET_KEY" \
  --parameters databaseUrl="$DATABASE_URL" \
  --parameters cookieSecret="$COOKIE_SECRET" \
  --parameters storageConnectionStringSecret="$AZURE_STORAGE_CONNECTION_STRING" \
  --parameters storageContainerNameAudioClips="$AZURE_STORAGE_BLOB_CONTAINER_NAME_AUDIO_CLIPS"
