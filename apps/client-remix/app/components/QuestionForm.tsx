import { Question } from "@prisma/client"
import { Form, useNavigation } from "@remix-run/react"
import React from "react"
import z from "zod"
import { FormDataEntries } from "~/types"

export const formName = 'formNameQuestionCreate'

export const schema = z.object({
  question: z.string(),
  answer1: z.string(),
  answer2: z.string(),
  answer4: z.string(),
  answer3: z.string(),
  difficulty: z.string().transform(s => parseFloat(s)),
})

export function getQuestionInput(formDataEntries: FormDataEntries): Omit<Question, 'createdAt' | 'updatedAt' | 'id'> {
  return schema.parse(formDataEntries)
}

export const Component = () => {
  const navigation = useNavigation()

  const isSubmitting = navigation.state === 'submitting'
    && navigation.formData.get('formName') === formName
  const formRef = React.createRef<HTMLFormElement>()

  React.useEffect(() => {
    if (isSubmitting) {
      formRef.current?.reset()
    }
  }, [isSubmitting])

  return (
    <Form method="post" ref={formRef} className="border p-2 rounded-md flex flex-col gap-2">
      <h1>Create</h1>
      <input type="text" autoComplete="off" placeholder='How much health does a Marine have?' id="question" name="question" required />
      <div className="flex gap-4">
        <label htmlFor='answer1'>Answer 1: </label>
        <input className="flex-grow" type="text" autoComplete="off" id="answer1" name="answer1" required />
      </div>
      <div className="flex gap-4">
        <label htmlFor='answer2'>Answer 2: </label>
        <input className="flex-grow" type="text" autoComplete="off" id="answer2" name="answer2" required />
      </div>
      <div className="flex gap-4">
        <label htmlFor='answer3'>Answer 3: </label>
        <input className="flex-grow" type="text" autoComplete="off" id="answer3" name="answer3" required />
      </div>
      <div className="flex gap-4">
        <label htmlFor='answer4'>Answer 4: </label>
        <input className="flex-grow" type="text" autoComplete="off" id="answer4" name="answer4" required />
      </div>
      <div className="flex gap-4">
        <label htmlFor='difficulty'>Difficulty: </label>
        <input className="flex-grow" type="number" autoComplete="off" id="difficulty" name="difficulty" required min={1} step={1} max={10} defaultValue={1} />
      </div>
      <div>
        <input type="hidden" name="answerIndex" value={0} />
        <input type="hidden" name="formName" value={formName} />
        <button type="submit">Create</button>
      </div>
    </Form>
  )
}
