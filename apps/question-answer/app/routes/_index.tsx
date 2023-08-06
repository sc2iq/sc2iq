import type { V2_MetaFunction } from "@remix-run/node"
import React from "react"

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
  }

  const onError = (reason: unknown) => {
    console.error('Error getting media stream')
    console.error(reason)
  }

  const onClickStartVisualizer = () => {
    const mediaStream = mediaRecorderRef.current?.stream
    if (!mediaStream) {
      console.error('You attempted to start the visualizer before the Media stream was initialized')
    }
    else {
      // Start the visualizer
      visualize(mediaStream)
    }
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
  }, [])

  React.useEffect(() => {
    audioCtxRef.current = new AudioContext()
  }, [])

  const onClickRecord: React.MouseEventHandler<HTMLButtonElement> = () => {
    console.log('onClickRecord')
    if (!mediaRecorderRef.current) {
      console.error('MediaRecorder not initialized')
      return
    }

    // Reset the audio chunks
    audioChunksRef.current = []

    const mediaRecorder = mediaRecorderRef.current
    mediaRecorder.ondataavailable = function (e) {
      audioChunksRef.current.push(e.data)
    }

    mediaRecorder.start()
    console.log(mediaRecorder.state)
    setMediaRecorderState(mediaRecorder.state)
    console.log("recorder started")
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
    const audioCtx = audioCtxRef.current
    if (!audioCtx) {
      return
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

  return (
    <>
      {isAudioSupported ?
        (
          <div className="w-1/2">
            <dl>
              <dt>Media State 1</dt><dd>{mediaRecorderRef.current?.state}</dd>
              <dt>Media State 2</dt><dd>{mediaRecorderState}</dd>
            </dl>
            <div className="py-4">
              <canvas id="visualizer" ref={canvasRef} className="bg-slate-500 ring-4 ring-offset-4 ring-blue-400 ring-offset-slate-900 m-2 rounded-2xl"></canvas>
            </div>
            <div id="buttons" className="flex flex-row gap-4">
              <button
                className={`rounded-xl p-3 bg-green-700 text-slate-50`}
                onClick={onClickRecord}
                disabled={mediaRecorderRef.current?.state === 'recording'}
              >
                Record
              </button>
              <button
                className={`rounded-xl p-3 bg-green-700 text-slate-50`}
                onClick={onClickStop}
                disabled={mediaRecorderRef.current?.state !== 'recording'}
              >
                Stop
              </button>

              <button
                className={`rounded-xl p-3 bg-green-700 text-slate-50`}
                onClick={onClickStartVisualizer}
              >
                Start Visualizer
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
