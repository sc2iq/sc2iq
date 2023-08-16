export function dataURLtoBlob(dataUrl: string) {
  const urlComponents = dataUrl.split(',')
  const mime = urlComponents.at(0)!.match(/:(.*?);/)![1]
  const byteString = globalThis.atob(urlComponents.at(1)!)
  let n = byteString.length
  const unit8Array = new Uint8Array(n)

  while (n--) {
    unit8Array[n] = byteString.charCodeAt(n)
  }

  return new Blob([unit8Array], { type: mime })
}
