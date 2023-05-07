export function tagsString(s: string, minLength = 3) {
  return s.toLowerCase()
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length >= minLength)
}
