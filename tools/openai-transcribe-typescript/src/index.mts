import { config } from "dotenv-flow"
import fetch from 'node-fetch'
import fs, { openAsBlob } from 'fs'
import OpenAI from "openai"


config()

export async function audioToText(audioFilePath: string, model = 'whisper-1'): Promise<{ text: string }> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioFilePath),
    model,
  })

  return transcription
}

export async function main() {
  const audioFilePath = "C:/repos/sc2/sc2iq/tools/openai-transcribe-typescript/resources/Recording.m4a"
  const data = await audioToText(audioFilePath)
  console.log(data)
}

main()
