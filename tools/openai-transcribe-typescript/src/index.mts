import { config } from "dotenv-flow"
import fetch from 'node-fetch'
import { openAsBlob } from "fs"

config()

export async function audioToText(audioFilePath: string, model = 'whisper-1'): Promise<unknown> {

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY!
  const audioFileBlob = await openAsBlob(audioFilePath)
  const formData = new FormData()
  formData.append('file', audioFileBlob as any)
  formData.append('model', model)

  const headers = {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'multipart/form-data'
  }

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: headers,
    body: formData as any
  })

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  return data
}

export async function main() {
  const audioFilePath = 'C:/repos/sc2/sc2iq/tools/opeanai-transcribe-typescript/resources/sample-6s.mp3'
  const audioFilePath2 = "C:/repos/sc2/sc2iq/tools/openai-transcribe-typescript/resources/Recording.m4a"
  const data = await audioToText(audioFilePath2)
  console.log(data)
}

main()
