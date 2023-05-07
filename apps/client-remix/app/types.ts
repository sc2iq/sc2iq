export type FormDataEntries = Record<string, FormDataEntryValue>

export type SearchInput = {
  text: string
  tags: string[]
  difficultyMin: number
  difficultyMax: number
}
