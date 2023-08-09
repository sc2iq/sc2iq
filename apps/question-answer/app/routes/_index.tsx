import type { ActionArgs, V2_MetaFunction } from "@remix-run/node"
import React from "react"
import classNames from "classnames"
import { PlayIcon, StopIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { audioClipsContainerClient } from "~/services/blobService"

export const meta: V2_MetaFunction = ({ matches }) => {
  const parentRoute = matches.find(m => (m as any)?.id === "root")
  const rootTitle = (parentRoute as any)?.meta?.find((m: any) => m.title).title

  return [
    { title: `${rootTitle} - Home` },
  ]
}

type AudioClip = {
  name: string
  url: string
}

const formIntentUpload = 'upload'

export const action = async ({ request }: ActionArgs) => {
  const rawFormData = await request.formData()
  const formData = Object.fromEntries(rawFormData.entries())

  if (formData.intent === formIntentUpload) {
    console.log('Upload form submitted')
    console.log({ formData })

    const uploadTime = Date.now()
    const filename = `audioClip_${uploadTime}.ogg`
    const fileBuffer = Buffer.from(formData.audioClipUrl as string, 'base64')
    const uploadResponse = await audioClipsContainerClient.uploadBlockBlob(filename, fileBuffer, fileBuffer.byteLength)

    const uploadData = {
      url: uploadResponse.blockBlobClient.url,
      name: uploadResponse.blockBlobClient.name,
    }
    console.log({ uploadData })

    return {
      uploadData,
    }
  }

  return null
}

export default function Index() {
  const [isAudioSupported, setIsAudioSupported] = React.useState(false)
  const mediaRecorderRef = React.useRef<MediaRecorder>()
  const [mediaRecorderState, setMediaRecorderState] = React.useState<'inactive' | 'recording' | 'paused'>('inactive')
  const audioCtxRef = React.useRef<AudioContext>()
  const audioChunksRef = React.useRef<Blob[]>([])
  const [audioClips, setAudioClips] = React.useState<AudioClip[]>([])
  const canvasRef = React.createRef<HTMLCanvasElement>()

  const onSuccess = (stream: MediaStream) => {
    console.log('onSuccess')

    // Create a new media recorder
    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder

    stream.getAudioTracks().forEach(track => {
      console.log(`Audio tracks: `, { track })
    })
  }

  const onError = (reason: unknown) => {
    console.error('Error getting media stream')
    console.error(reason)
  }

  React.useEffect(() => {
    if (typeof navigator.mediaDevices.getUserMedia === 'function') {
      console.log('getUserMedia supported.')
      setIsAudioSupported(true)

      const constraints: MediaStreamConstraints = {
        audio: true,
      }

      navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError)
    }
    else {
      console.error('getUserMedia not supported on your browser!')
      setIsAudioSupported(false)
    }

    async function getDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices()
      console.log(devices)
    }

    getDevices()
  }, [])

  const onClickRecord: React.MouseEventHandler<HTMLButtonElement> = () => {
    console.log('onClickRecord')
    if (!mediaRecorderRef.current) {
      console.error('MediaRecorder not initialized')
      return
    }

    // Reset the audio chunks
    audioChunksRef.current = []

    // Record new chunks of data
    const mediaRecorder = mediaRecorderRef.current
    mediaRecorder.ondataavailable = function (e) {
      audioChunksRef.current.push(e.data)
    }

    mediaRecorder.onstop = function (e) {
      const defaultName = 'Unnamed clip'
      const clipName = prompt('Enter a name for your sound clip?', defaultName)

      const blob = new Blob(audioChunksRef.current, { 'type': 'audio/ogg; codecs=opus' })
      audioChunksRef.current = []

      const audioObjectUrl = window.URL.createObjectURL(blob)
      const audioClip: AudioClip = {
        name: clipName ?? defaultName,
        url: audioObjectUrl,
      }

      setAudioClips((prevAudioClips) => [...prevAudioClips, audioClip])
    }

    const mediaStream = mediaRecorder.stream
    if (!mediaStream) {
      console.error('You attempted to start the visualizer before the Media stream was initialized')
    }

    // Start the visualizer
    visualize(mediaStream)

    mediaRecorder.start()
    setMediaRecorderState(mediaRecorder.state)
    console.log(mediaRecorder.state)
    console.log("Recording started")
  }

  const onClickStop: React.MouseEventHandler<HTMLButtonElement> = () => {
    console.log('onClickStop')
    if (!mediaRecorderRef.current) {
      console.error('MediaRecorder not initialized')
      return
    }

    const mediaRecorder = mediaRecorderRef.current
    mediaRecorder.stop()
    console.log(mediaRecorder.state)
    setMediaRecorderState(mediaRecorder.state)
    console.log("recorder stopped")
  }

  const visualize = (stream: MediaStream) => {
    let audioCtx = audioCtxRef.current
    if (!audioCtx) {
      audioCtx = new AudioContext()
      audioCtxRef.current = audioCtx
    }

    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 2048
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const source = audioCtx.createMediaStreamSource(stream)
    source.connect(analyser)

    draw(canvasRef.current!, analyser, dataArray, bufferLength)
  }

  const draw = (canvas: HTMLCanvasElement, analyser: AnalyserNode, dataArray: Uint8Array, bufferLength: number) => {
    const canvasCtx = canvas.getContext("2d")!
    const WIDTH = canvas.width
    const HEIGHT = canvas.height

    analyser.getByteTimeDomainData(dataArray)

    canvasCtx.fillStyle = 'rgb(250, 250, 250)'
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT)

    canvasCtx.lineWidth = 2
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)'

    canvasCtx.beginPath()

    let sliceWidth = WIDTH * 1.0 / bufferLength
    let x = 0

    for (let i = 0; i < bufferLength; i++) {

      let v = dataArray[i] / 128.0
      let y = v * HEIGHT / 2

      if (i === 0) {
        canvasCtx.moveTo(x, y)
      } else {
        canvasCtx.lineTo(x, y)
      }

      x += sliceWidth
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2)
    canvasCtx.stroke()

    requestAnimationFrame(() => draw(canvas, analyser, dataArray, bufferLength))
  }

  const onClickDeleteClip = (audioClip: AudioClip) => {
    setAudioClips((prevAudioClips) => prevAudioClips.filter((clip) => clip !== audioClip))
  }

  const isRecording = mediaRecorderRef.current?.state === 'recording'
  const isRecordButtonDisabled = !isAudioSupported || isRecording
  const recordButtonClassNames = classNames({
    [`flex flex-row gap-2 p-4 m-2 px-6 rounded-md ring-2 ring-offset-4 border-none font-semibold`]: true,
    ['text-slate-300 bg-blue-800 ring-blue-400 ring-offset-slate-900 cursor-not-allowed']: isRecordButtonDisabled,
    ['text-white bg-green-500 ring-green-200 ring-offset-green-900 shadow-[0_5px_80px_-15px_white] shadow-green-200']: !isRecording,
    ['text-white bg-blue-500 ring-blue-200 ring-offset-slate-900']: !isRecordButtonDisabled && !isRecordButtonDisabled
  })

  const isStopButtonDisabled = !isAudioSupported || !isRecording
  const stopButtonClassNames = classNames({
    [`flex flex-row gap-2 p-4 m-2 px-4 rounded-md ring-2 ring-offset-4 border-none font-semibold`]: true,
    ['text-slate-300 bg-blue-800 ring-blue-400 ring-offset-slate-900 cursor-not-allowed']: isStopButtonDisabled,
    ['text-white bg-red-500 ring-red-200 ring-offset-slate-900']: !isStopButtonDisabled
  })

  const deleteButtonClassNames = classNames({
    [`flex flex-row gap-2 p-2 px-4 m-1 mx-2 rounded-lg ring-2 ring-offset-4 border-none font-semibold`]: true,
    ['text-white bg-red-500 ring-red-200 ring-offset-slate-900']: true
  })

  return (
    <>
      {isAudioSupported ?
        (
          <div className="flex flex-col gap-8 items-center">
            <dl className="grid grid-cols-[max-content_1fr] gap-x-4">
              <dt>Device</dt><dd>{mediaRecorderRef.current?.stream.getAudioTracks().at(0)?.label}</dd>
              <dt>State</dt><dd>{mediaRecorderRef.current?.state}</dd>
              <dt>State</dt><dd>{mediaRecorderState}</dd>
            </dl>
            <div className="min-w-[700px] flex flex-col gap-2">
              <h2 className="font-bold text-xl">Audio Visualizer:</h2>
              <canvas id="visualizer" ref={canvasRef} className="w-full h-20 bg-slate-500 ring-4 ring-offset-4 ring-blue-400 ring-offset-slate-900 m-2 mx-2 rounded-xl"></canvas>
            </div>
            <div className="flex flex-row gap-4 justify-center">
              <button
                className={recordButtonClassNames}
                onClick={onClickRecord}
                disabled={isRecordButtonDisabled}
              >
                <PlayIcon className="h-6 w-6" />
                Record
              </button>
              <button
                className={stopButtonClassNames}
                onClick={onClickStop}
                disabled={isStopButtonDisabled}
              >
                <StopIcon className="h-6 w-6" />
                Stop
              </button>
            </div>
            <div className="min-w-[500px] flex flex-col gap-2">
              <h2 className="font-bold text-xl">Recorded Clips ({audioClips.length}):</h2>
              <div className="rounded-md flex flex-col gap-4">
                {audioClips.length === 0
                  ? "No Clips Recorded"
                  : audioClips.map(clip => (
                    <div key={clip.name} className="rounded-md flex flex-col gap-2">
                      <p>{clip.name}</p>
                      <div className="flex flex-row gap-6 items-center">
                        <audio controls src={clip.url} className="w-full"></audio>
                        <button onClick={() => onClickDeleteClip(clip)} className={deleteButtonClassNames}>
                          <XMarkIcon className="h-6 w-6" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )
        : (
          <p>Audio is not supported</p>
        )}
    </>
  )
}
