import * as Icons from "@heroicons/react/24/solid"
import { Poll } from "@prisma/client"
import { Form, useNavigation } from "@remix-run/react"
import React from "react"
import z from "zod"
import { FormDataEntries } from "~/types"

export const formName = 'formNamePollCreate'

export const schema = z.object({
  question: z.string(),
  answer1: z.string(),
  answer2: z.string(),
  answer4: z.string(),
  answer3: z.string(),
})

export function getFormData(formDataEntries: FormDataEntries): Omit<Poll, 'state' | 'createdAt' | 'createdBy' | 'updatedAt' | 'id'> & Partial<Poll> {
  const pollFormData = schema.parse(formDataEntries)

  const answers = [
    pollFormData.answer1,
    pollFormData.answer2,
    pollFormData.answer3,
    pollFormData.answer4,
  ]

  if (new Set(answers).size !== 4) {
    throw new Error(`You attempted to submit a poll but there were duplicate answers. All answers must be unique! Answers: [${[...answers].join(', ')}]`)
  }

  return pollFormData
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
    <Form method="post" ref={formRef} className="p-5 rounded-xl flex flex-col gap-2 bg-slate-200 border border-slate-300">
      <h1 className="flex gap-2 items-center text-lg font-medium"><Icons.PencilSquareIcon className="h-8 w-8" /> Create Poll</h1>
      <input className="p-1 px-3 rounded-md" type="text" autoComplete="off" placeholder='Should we introduce asymmetrical maps?' id="question" name="question" required />
      <div className="flex gap-4 rounded-lg">
        <label className="flex gap-2 items-center w-40" htmlFor='answer1'><Icons.QuestionMarkCircleIcon className="h-6 w-6 text-slate-500" />Option 1: </label>
        <input className="flex-grow p-1 px-3 rounded-md" type="text" autoComplete="off" id="answer1" name="answer1" required placeholder="Yes" />
      </div>
      <div className="flex gap-4 rounded-lg">
        <label className="flex gap-2 items-center w-40" htmlFor='answer2'><Icons.QuestionMarkCircleIcon className="h-6 w-6 text-slate-500" /> Option 2: </label>
        <input className="flex-grow p-1 px-3 rounded-md" type="text" autoComplete="off" id="answer2" name="answer2" required placeholder="Yes" />
      </div>
      <div className="flex gap-4 rounded-lg">
        <label className="flex gap-2 items-center w-40" htmlFor='answer3'><Icons.QuestionMarkCircleIcon className="h-6 w-6 text-slate-500" /> Option 3: </label>
        <input className="flex-grow p-1 px-3 rounded-md" type="text" autoComplete="off" id="answer3" name="answer3" required placeholder="No" />
      </div>
      <div className="flex gap-4 rounded-lg">
        <label className="flex gap-2 items-center w-40" htmlFor='answer4'><Icons.QuestionMarkCircleIcon className="h-6 w-6 text-slate-500" /> Option 4: </label>
        <input className="flex-grow p-1 px-3 rounded-md" type="text" autoComplete="off" id="answer4" name="answer4" required placeholder="No" />
      </div>
      <div className="flex gap-4 rounded-lg">
        <label className="flex gap-2 items-center w-40" htmlFor='tags'><Icons.TagIcon className="h-6 w-6" /> Tags:</label>
        <input className="flex-grow p-1 px-3 rounded-md" type="text" autoComplete="off" id="tags" name="tags" />
      </div>
      <input type="hidden" name="formName" value={formName} />
      <div className="flex flex-row gap-2 mt-2">
        <button className="border px-4 py-2 flex gap-2 items-center bg-slate-600 text-slate-100 rounded-lg" type="submit"><Icons.PencilIcon className="h-5 w-5" /> Submit</button>
        <button className="border px-4 py-2 flex gap-2 items-center bg-slate-400 rounded-lg" type="reset"><Icons.ArrowPathIcon className="h-5 w-5" /> Reset</button>
      </div>
    </Form>
  )
}
