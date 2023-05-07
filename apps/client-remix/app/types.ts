import { Question } from "@prisma/client"

export type FormDataEntries = Record<string, FormDataEntryValue>

export type PartialQuestion = Omit<Question, 'state' | 'createdAt' | 'createdBy' | 'updatedAt' | 'id'> & Partial<Question>
export type QuestionFormData =
  | PartialQuestion
  & {
    tags: string[]
  }

export type QuestionInput =
  | PartialQuestion

export type SearchInput = {
  text: string
  tags: string[]
  difficultyMin: number
  difficultyMax: number
}

