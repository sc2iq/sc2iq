import * as Icons from "@heroicons/react/24/solid"
import { Form, useNavigation } from "@remix-run/react"
import React from "react"
import z from "zod"
import { tagsString } from "~/helpers"
import { FormDataEntries, PartialQuestion } from "~/types"

export const formName = 'formNameQuestionCreate'

export const schema = z.object({
  question: z.string(),
  answer1: z.string(),
  answer2: z.string(),
  answer4: z.string(),
  answer3: z.string(),
  difficulty: z.string().transform(s => parseFloat(s)),
  tags: z.string().transform(s => tagsString(s)),
})

export function getFormData(formDataEntries: FormDataEntries): { question: PartialQuestion, tags: string[] } {
  const questionFormData = schema.parse(formDataEntries)
  const tags = questionFormData.tags
  delete (questionFormData as any).tags

  const answers = [
    questionFormData.answer1,
    questionFormData.answer2,
    questionFormData.answer3,
    questionFormData.answer4,
  ]

  if (new Set(answers).size !== 4) {
    throw new Error(`You attempted to submit a question but there were duplicate answers. All answers must be unique! Answers: [${[...answers].join(', ')}]`)
  }

  return {
    question: questionFormData,
    tags: tags
  }
}

export const Component = () => {
  const navigation = useNavigation()

  const isSubmitting = navigation.state === 'submitting'
    && navigation.formData.get('formName') === formName
  const formRef = React.createRef<HTMLFormElement>()
  const [isDifficultyRatingsHelpVisible, setDifficultyHelp] = React.useState(false)

  React.useEffect(() => {
    if (isSubmitting) {
      formRef.current?.reset()
    }
  }, [isSubmitting])

  return (
    <Form method="post" ref={formRef} className="border p-5 rounded-xl flex flex-col gap-2 bg-slate-200 border-slate-300">
      <h1 className="flex gap-2 items-center text-lg font-medium"><Icons.PencilSquareIcon className="h-8 w-8" /> Create Question</h1>
      <input className="p-1 px-2 rounded-md" type="text" autoComplete="off" placeholder='How much health does a Marine have?' id="question" name="question" required />
      <div className="flex gap-4 rounded-lg">
        <label className="flex gap-2 items-center w-40" htmlFor='answer1'><Icons.CheckIcon className="h-6 w-6 text-green-600" /> Correct Answer: </label>
        <input className="flex-grow p-1 px-2 rounded-md" type="text" autoComplete="off" id="answer1" name="answer1" placeholder="45" required />
      </div>
      <div className="bg-slate-400 h-px"></div>
      <div className="flex gap-4 rounded-lg">
        <label className="flex gap-2 items-center w-40" htmlFor='answer2'><Icons.XMarkIcon className="h-6 w-6 text-red-700" /> Alternate Answer: </label>
        <input className="flex-grow p-1 px-2 rounded-md" type="text" autoComplete="off" id="answer2" name="answer2" placeholder="55" required />
      </div>
      <div className="flex gap-4 rounded-lg">
        <label className="flex gap-2 items-center w-40" htmlFor='answer3'><Icons.XMarkIcon className="h-6 w-6 text-red-700" /> Alternate Answer: </label>
        <input className="flex-grow p-1 px-2 rounded-md" type="text" autoComplete="off" id="answer3" name="answer3" placeholder="35" required />
      </div>
      <div className="flex gap-4 rounded-lg">
        <label className="flex gap-2 items-center w-40" htmlFor='answer4'><Icons.XMarkIcon className="h-6 w-6 text-red-700" /> Alternate Answer: </label>
        <input className="flex-grow p-1 px-2 rounded-md" type="text" autoComplete="off" id="answer4" name="answer4" placeholder="65" required />
      </div>
      <div className="flex gap-4 rounded-lg">
        <label className="flex gap-2 items-center w-40" htmlFor='difficulty'><Icons.ScaleIcon className="h-6 w-6 text-slate-500" /> Difficulty: </label>
        <input className="flex-grow p-1 px-2 rounded-md" type="number" autoComplete="off" id="difficulty" name="difficulty" required min={1} step={1} max={10} defaultValue={1} />
        <button type="button"
          onClick={() => setDifficultyHelp(x => !x)}
          className="flex gap-2 items-center rounded-md p-1 px-2 bg-slate-400 text-slate-50 hover:bg-slate-500 hover:text-white"
        >
          <Icons.QuestionMarkCircleIcon className="h-6 w-6 text-slate-500" /> How to determine diffuculty?
        </button>
      </div>
      {isDifficultyRatingsHelpVisible && (
        <div className="flex gap-4 rounded-lg">
          <label className="flex gap-2 items-center w-40" htmlFor='difficulty'></label>
          <div className="flex-grow p-1 px-2 rounded-md text-slate-500">1. Unit Stats 2. Unit Battles 3. Timings 4. Tournament Stats 5. Odd Unit Behavior 10: Rare Player Facts</div>
        </div>
      )}
      <div className="flex gap-4 rounded-lg">
        <label className="flex gap-2 items-center w-40" htmlFor='tags'><Icons.TagIcon className="h-6 w-6 text-slate-500" /> Tags:</label>
        <input className="flex-grow p-1 px-2 rounded-md" type="text" autoComplete="off" id="tags" name="tags" placeholder="terran, unit, stats" />
      </div>
      <input type="hidden" name="formName" value={formName} />
      <div className="flex flex-row gap-2 mt-2">
        <button className="border px-4 py-2 flex gap-2 items-center bg-slate-600 text-slate-100 rounded-lg" type="submit"><Icons.PencilIcon className="h-5 w-5" /> Submit</button>
        <button className="border px-4 py-2 flex gap-2 items-center bg-slate-400 rounded-lg" type="reset"><Icons.ArrowPathIcon className="h-5 w-5" /> Reset</button>
      </div>
    </Form>
  )
}
