import { Question } from "@prisma/client"
import { Form } from "@remix-run/react"
import z from "zod"
import { FormDataEntries } from "~/types"

export const formName = 'formNameQuestionCreate'

export const schema = z.object({
  question: z.string(),
  answer1: z.string(),
  answer2: z.string(),
  answer4: z.string(),
  answer3: z.string(),
})

export function getQuestionInput(formDataEntries: FormDataEntries): Omit<Question, 'createdAt' | 'updatedAt' | 'id'> {
  return schema.parse(formDataEntries)
}

export const Component = () => {
  return (
    <Form method="post">
      <h1>Create</h1>
      <div>
        <label htmlFor='question'>Question: </label>
        <input type="text" placeholder='How much health does a Marine have?' id="question" name="question" required />
      </div>
      <div>
        <label htmlFor='answer1'>Answer 1: </label>
        <input type="text" id="answer1" name="answer1" required />
      </div>
      <div>
        <label htmlFor='answer2'>Answer 2: </label>
        <input type="text" id="answer2" name="answer2" required />
      </div>
      <div>
        <label htmlFor='answer3'>Answer 3: </label>
        <input type="text" id="answer3" name="answer3" required />
      </div>
      <div>
        <label htmlFor='answer4'>Answer 4: </label>
        <input type="text" id="answer4" name="answer4" required />
      </div>
      <div>
        <input type="hidden" name="answerIndex" value={0} />
        <input type="hidden" name="formName" value={formName} />
        <button type="submit">Create</button>
      </div>
    </Form>
  )
}
