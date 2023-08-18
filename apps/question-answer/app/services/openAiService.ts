import fetch from 'node-fetch'

export async function audioToText(audioFile: File, model = 'whisper-1'): Promise<string> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY!
  const formData = new FormData()
  formData.append('file', audioFile)
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

  const data = await response.json()

  return data

}
