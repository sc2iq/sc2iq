import type { ActionArgs, V2_MetaFunction } from "@remix-run/node"
import React from "react"
import classNames from "classnames"
import { PlayIcon, StopIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { audioClipsContainerClient } from "~/services/blobService"
import { useFetcher } from "@remix-run/react"
import { createId } from "@paralleldrive/cuid2"
import { unstable_parseMultipartFormData, unstable_composeUploadHandlers, unstable_createFileUploadHandler, unstable_createMemoryUploadHandler } from "@remix-run/node"

export const meta: V2_MetaFunction = ({ matches }) => {
  const parentRoute = matches.find(m => (m as any)?.id === "root")
  const rootTitle = (parentRoute as any)?.meta?.find((m: any) => m.title).title

  return [
    { title: `${rootTitle} - Home` },
  ]
}

type AudioClip = {
  id: string
  name: string
  url: string
  blobText: string
}

type UploadedAudioClip = {
  id: string
  url: string
  name: string
}

const formIntentUpload = 'upload'

export const action = async ({ request }: ActionArgs) => {
  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      maxPartSize: 5_000_000,
      file: ({ filename }) => filename,
    }),
    // parse everything else into memory
    unstable_createMemoryUploadHandler()
  )

  const actionUrl = new URL(request.url)
  console.log({ actionUrl: actionUrl.href })

  if (actionUrl.searchParams.get('intent') === formIntentUpload) {
    const formData = await unstable_parseMultipartFormData(
      request,
      uploadHandler,
    )
    const formDataObject = Object.fromEntries(formData.entries())

    const uploadTime = Date.now()
    const audioFile = formDataObject.audioFile as File
    const audioFileBuffer = await audioFile.arrayBuffer()
    const filename = `audioClip_${uploadTime}.mp3`

    const uploadResponse = await audioClipsContainerClient.uploadBlockBlob(filename, audioFileBuffer, audioFileBuffer.byteLength)

    const uploadData: UploadedAudioClip = {
      id: formDataObject.id as string,
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
  const [audioDevices, setAudioDevices] = React.useState<MediaDeviceInfo[]>([])
  const [selectedAudioDevice, setSelectedAudioDevice] = React.useState<MediaDeviceInfo>()
  const [uploadedAudioClipDatas, setUploadedAudioClipDatas] = React.useState<UploadedAudioClip[]>([])
  const mediaRecorderRef = React.useRef<MediaRecorder>()
  const [mediaRecorderState, setMediaRecorderState] = React.useState<'inactive' | 'recording' | 'paused'>('inactive')
  const audioCtxRef = React.useRef<AudioContext>()
  const audioChunksRef = React.useRef<Blob[]>([])
  const [audioClips, setAudioClips] = React.useState<AudioClip[]>([])
  const canvasRef = React.createRef<HTMLCanvasElement>()
  const uploadFetcher = useFetcher<typeof action>()

  const onSuccess = (stream: MediaStream) => {
    console.log('onSuccess')

    // Create a new media recorder
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
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
    async function setup() {

      if (typeof navigator.mediaDevices.getUserMedia === 'function') {
        console.log('getUserMedia IS supported on your browser!')
        setIsAudioSupported(true)

        const devices = await navigator.mediaDevices.enumerateDevices()
        const innerAudioDevices = devices.filter(d => d.kind === 'audioinput')
        setAudioDevices(innerAudioDevices)

        const defaultDevice = innerAudioDevices.find(d => d.deviceId === 'default')
        setSelectedAudioDevice(defaultDevice)

        const constraints: MediaStreamConstraints = {
          audio: true,
        }

        navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError)
      }
      else {
        console.error('getUserMedia IS NOT supported on your browser!')
        setIsAudioSupported(false)
      }
    }

    setup()
  }, [])

  React.useEffect(() => {
    const uploadData = uploadFetcher.data?.uploadData
    if (!uploadData) return

    if (uploadedAudioClipDatas.some(d => d.id === uploadData.id)) {
      console.log(`Upload data already exists for id: ${uploadData.id}`)
      return
    }

    setUploadedAudioClipDatas((prevUploadedAudioClipDatas) => [...prevUploadedAudioClipDatas, uploadData])
    console.log(`Audio clips: ${uploadData.id} successful uploaded!`)
  }, [uploadFetcher])

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

    mediaRecorder.onstop = async function (e) {
      const defaultName = `DefaultClipName_${Date.now()}`
      const filename = `${defaultName}.webm`
      const audioFile = new File(audioChunksRef.current, filename, { 'type': 'audio/webm' })
      // const blob = new Blob(audioChunksRef.current, { 'type': 'audio/ogg; codecs=opus' })
      // const blob = new Blob(audioChunksRef.current)
      audioChunksRef.current = []

      const audioObjectUrl = globalThis.URL.createObjectURL(audioFile)
      const fileText = await audioFile.text()
      const audioClip: AudioClip = {
        id: createId(),
        name: audioFile.name,
        url: audioObjectUrl,
        blobText: fileText,
      }

      setAudioClips(prevAudioClips => [...prevAudioClips, audioClip])

      const formData = new FormData()
      formData.append('id', audioClip.id)
      formData.append('intent', formIntentUpload)
      formData.append('name', audioClip.name)
      formData.append('blobText', audioClip.blobText)
      formData.append('audioFile', audioFile, filename)

      uploadFetcher.submit(formData, {
        method: 'POST',
        action: `?index&intent=${formIntentUpload}`,
        encType: 'multipart/form-data',
      })
    }

    const mediaStream = mediaRecorder.stream
    if (!mediaStream) {
      console.error('You attempted to start the visualizer before the Media stream was initialized')
    }

    visualize(mediaStream)

    mediaRecorder.start()

    setMediaRecorderState(mediaRecorder.state)
    console.log(`Recording started ${mediaRecorder.state}`)
  }

  const onClickStop: React.MouseEventHandler<HTMLButtonElement> = () => {
    console.log('onClickStop')
    if (!mediaRecorderRef.current) {
      console.error('MediaRecorder not initialized')
      return
    }

    const mediaRecorder = mediaRecorderRef.current
    mediaRecorder.stop()

    setMediaRecorderState(mediaRecorder.state)
    console.log(`Recorder stopped! ${mediaRecorder.state}`)
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

    canvasCtx.fillStyle = 'rgb(51, 65, 85)'
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT)

    canvasCtx.lineWidth = 2
    canvasCtx.strokeStyle = 'rgb(255, 255, 255)'

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
    globalThis.URL.revokeObjectURL(audioClip.url)

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

  const onChangeAudioDevice: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    const selectedDeviceId = event.target.value
    const selectedDevice = audioDevices.find(d => d.deviceId === selectedDeviceId)
    if (!selectedDevice) {
      console.error(`No device found with id: ${selectedDeviceId}`)
      return
    }

    setSelectedAudioDevice(selectedDevice)

    const onSuccess = (stream: MediaStream) => {
      console.log(`Audio Device changed to: ${selectedDevice.label}`)
      // Create a new media recorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      stream.getAudioTracks().forEach(track => {
        console.log(`Audio tracks: `, { track })
      })
    }

    const constraints: MediaStreamConstraints = {
      audio: {
        deviceId: selectedDeviceId,
      },
    }

    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError)
  }

  const joinedAudioClips = audioClips.map(clientClip => {
    const joinedObject = {
      clientClip,
      uploadedClipData: null as UploadedAudioClip | null,
    }

    const uploadedAudioClipData = uploadedAudioClipDatas.find(d => d.id === clientClip.id)
    if (uploadedAudioClipData) {
      joinedObject.uploadedClipData = uploadedAudioClipData
    }

    return joinedObject
  })

  return (
    <>
      {isAudioSupported ?
        (
          <div className="flex flex-col gap-8 items-stretch min-w-[700px]">
            <div className="flex flex-col gap-4">
              <h2 className="font-semibold text-2xl">Devices:</h2>
              <select onChange={onChangeAudioDevice} className="w-full h-20 bg-slate-700 text-slate-100 text-2xl px-4 ring-4 ring-offset-4 ring-blue-400 ring-offset-slate-900 m-2 mx-2 rounded-xl">
                {audioDevices.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
                ))}
              </select>
            </div>
            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 text-slate-300">
              <dt>Selected Device:</dt><dd>{selectedAudioDevice?.label ?? mediaRecorderRef.current?.stream.getAudioTracks().at(0)?.label}</dd>
              <dt>State:</dt><dd>{mediaRecorderState}</dd>
            </dl>
            <div className="flex flex-col gap-4">
              <h2 className="font-semibold text-2xl">Audio Visualizer:</h2>
              <canvas id="visualizer" ref={canvasRef} className="w-full h-20 bg-slate-700 ring-4 ring-offset-4 ring-blue-400 ring-offset-slate-900 m-2 mx-2 rounded-xl"></canvas>
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
              <h2 className="font-bold text-xl">Recorded Clips ({joinedAudioClips.length}):</h2>
              <div className="rounded-md flex flex-col gap-4">
                {joinedAudioClips.length === 0
                  ? "No Clips Recorded"
                  : joinedAudioClips.map(clip => {
                    const state = clip.uploadedClipData ? 'Uploaded' : 'Upload...'
                    return (
                      <div key={clip.clientClip.name} className="rounded-md flex flex-col gap-2">
                        <p>{clip.clientClip.name} <span className="text-slate-500 text-sm">({clip.clientClip.id})</span></p>
                        <p>State: {state}</p>
                        <p>Download URL: <a href={clip.uploadedClipData?.url} className="text-teal-200" target="_blank">{clip.uploadedClipData?.url.split('/').at(-1)}</a></p>
                        <div className="flex flex-row gap-6 items-center">
                          <audio controls src={clip.clientClip.url} className="w-full"></audio>
                          <button onClick={() => onClickDeleteClip(clip.clientClip)} className={deleteButtonClassNames}>
                            <XMarkIcon className="h-6 w-6" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                  })}
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
