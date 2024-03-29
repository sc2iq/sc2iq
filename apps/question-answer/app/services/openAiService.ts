import OpenAI from "openai"
import fs from 'node:fs'

export async function audioToText(audioFilePathOrStream: string | fs.ReadStream, openAiKey: string, model = 'whisper-1') {
  const fileStream = typeof audioFilePathOrStream === 'string'
    ? fs.createReadStream(audioFilePathOrStream)
    : audioFilePathOrStream

  const openai = new OpenAI({ apiKey: openAiKey })
  const transcription = await openai.audio.transcriptions.create({
    file: fileStream,
    model,
  })

  return transcription
}
