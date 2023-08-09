import { BlobServiceClient } from "@azure/storage-blob"

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING!)
const audioClipsContainerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_BLOB_CONTAINER_NAME_AUDIO_CLIPS!)

export {
    audioClipsContainerClient,
}
