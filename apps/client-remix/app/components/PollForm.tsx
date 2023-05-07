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
    <Form method="post" ref={formRef} className="border p-5 rounded-xl flex flex-col gap-2 bg-slate-200 border-slate-400">
      <h1 className="flex gap-2 items-center text-lg font-medium"><Icons.PencilSquareIcon className="h-8 w-8" /> Create Poll</h1>
      <input className="p-1 px-2" type="text" autoComplete="off" placeholder='How much health does a Marine have?' id="question" name="question" required />
      <div className="flex gap-4 rounded-lg">
        <label className="flex gap-2 items-center" htmlFor='answer1'><Icons.CheckIcon className="h-6 w-6 text-green-600" /> Correct Answer: </label>
        <input className="flex-grow p-1 px-2" type="text" autoComplete="off" id="answer1" name="answer1" required />
      </div>
      <div className="bg-slate-400 h-1"></div>
      <div className="flex gap-4 rounded-lg">
        <label className="flex gap-2 items-center" htmlFor='answer2'><Icons.XMarkIcon className="h-6 w-6 text-red-700" /> Answer 2: </label>
        <input className="flex-grow p-1 px-2" type="text" autoComplete="off" id="answer2" name="answer2" required />
      </div>
      <div className="flex gap-4 rounded-lg">
        <label className="flex gap-2 items-center" htmlFor='answer3'><Icons.XMarkIcon className="h-6 w-6 text-red-700" /> Answer 3: </label>
        <input className="flex-grow p-1 px-2" type="text" autoComplete="off" id="answer3" name="answer3" required />
      </div>
      <div className="flex gap-4 rounded-lg">
        <label className="flex gap-2 items-center" htmlFor='answer4'><Icons.XMarkIcon className="h-6 w-6 text-red-700" /> Answer 4: </label>
        <input className="flex-grow p-1 px-2" type="text" autoComplete="off" id="answer4" name="answer4" required />
      </div>
      <input type="hidden" name="formName" value={formName} />
      <div className="mt-2">
        <button className="border px-4 py-2 flex gap-2 items-center bg-slate-600 text-slate-100 rounded-lg" type="submit"><Icons.PencilIcon className="h-5 w-5" /> Submit</button>
      </div>
    </Form>
  )
}
