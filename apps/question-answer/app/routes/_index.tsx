import type { V2_MetaFunction } from "@remix-run/node"
import React from "react"
import classNames from "classnames"
import { BeakerIcon, PlayIcon, StopIcon } from '@heroicons/react/24/solid'

export const meta: V2_MetaFunction = ({ matches }) => {
  const parentRoute = matches.find(m => (m as any)?.id === "root")
  const rootTitle = (parentRoute as any)?.meta?.find((m: any) => m.title).title

  return [
    { title: `${rootTitle} - Home` },
  ]
}

export default function Index() {
  const [isAudioSupported, setIsAudioSupported] = React.useState(false)
  const mediaRecorderRef = React.useRef<MediaRecorder>()
  const [mediaRecorderState, setMediaRecorderState] = React.useState<'inactive' | 'recording' | 'paused'>('inactive')
  const audioCtxRef = React.useRef<AudioContext>()
  const audioChunksRef = React.useRef<Blob[]>([])
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

  const isRecording = mediaRecorderRef.current?.state === 'recording'
  const isRecordButtonDisabled = !isAudioSupported || isRecording
  const recordButtonClassNames = classNames({
    [`flex flex-row gap-2 p-4 m-2 px-6 rounded-md ring-2 ring-offset-4 border-none font-semibold`]: true,
    ['text-slate-300 bg-blue-800 ring-blue-400 ring-offset-slate-900']: isRecordButtonDisabled,
    ['text-white bg-green-500 ring-green-200 ring-offset-green-900 shadow-[0_5px_80px_-15px_white] shadow-green-200']: !isRecording,
    ['text-white bg-blue-500 ring-blue-200 ring-offset-slate-900']: !isRecordButtonDisabled && !isRecordButtonDisabled
  })

  const isStopButtonDisabled = !isAudioSupported || !isRecording
  const stopButtonClassNames = classNames({
    [`flex flex-row gap-2 p-4 m-2 px-4 rounded-md ring-2 ring-offset-4 border-none font-semibold`]: true,
    ['text-slate-300 bg-blue-800 ring-blue-400 ring-offset-slate-900']: isStopButtonDisabled,
    ['text-white bg-red-500 ring-red-200 ring-offset-slate-900']: !isStopButtonDisabled
  })

  return (
    <>
      {isAudioSupported ?
        (
          <div className="min-w-[500px]">
            <dl className="grid grid-cols-[max-content_1fr] gap-x-4">
              <dt>Device</dt><dd>{mediaRecorderRef.current?.stream.getAudioTracks().at(0)?.label}</dd>
              <dt>State</dt><dd>{mediaRecorderRef.current?.state}</dd>
              <dt>State</dt><dd>{mediaRecorderState}</dd>
            </dl>
            <div className="py-4">
              <canvas id="visualizer" ref={canvasRef} className="w-full h-20 bg-slate-500 ring-4 ring-offset-4 ring-blue-400 ring-offset-slate-900 m-2 rounded-xl"></canvas>
            </div>
            <div id="buttons" className="flex flex-row gap-4">
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
          </div>
        )
        : (
          <p>Audio is not supported</p>
        )}
    </>
  )
}
