import * as Icons from "@heroicons/react/24/solid"
import { Question } from "@prisma/client"
import { Link } from "@remix-run/react"

type Props = {
  // TODO: Find way to use SerializeObject<UndefinedToOptional<Question>>
  question: Omit<Question, 'createdAt' | 'updatedAt'> & { createdAt: string, updatedAt: string }
  error?: string
}

export default function Component(props: Props) {
  return (
    <div className="border p-5 rounded-xl flex flex-col gap-2 bg-slate-200 border-slate-300">
      <h2 className="flex gap-2 items-center text-2xl py-2">
        <span className="font-semibold">{props.question.question}</span>
        <Link to={`/questions/${props.question.id}`} className="flex gap-2 items-center ml-auto p-1 px-2 bg-slate-300 rounded-md text-lg text-slate-600"><Icons.QuestionMarkCircleIcon className="h-6 w-6 text-slate-400 inline-block" /> View Details</Link>
      </h2>
      <div className="flex gap-4">
        <div className="flex gap-2 items-center w-40"><Icons.CheckIcon className="h-6 w-6 text-green-600" /> Correct Answer: </div>
        <div className="flex-grow rounded-md p-2 px-3 bg-white">{props.question.answer1}</div>
      </div>
      <div className="bg-slate-400 h-px"></div>
      <div className="flex gap-4">
        <div className="flex gap-2 items-center w-40"><Icons.XMarkIcon className="h-6 w-6 text-red-700" /> Alternate Answer: </div>
        <div className="flex-grow p-2 px-3 rounded-md bg-white">{props.question.answer2}</div>
      </div>
      <div className="flex gap-4">
        <div className="flex gap-2 items-center w-40"><Icons.XMarkIcon className="h-6 w-6 text-red-700" /> Alternate Answer: </div>
        <div className="flex-grow p-2 px-3 rounded-md bg-white">{props.question.answer3}</div>
      </div>
      <div className="flex gap-4">
        <div className="flex gap-2 items-center w-40"><Icons.XMarkIcon className="h-6 w-6 text-red-700" /> Alternate Answer: </div>
        <div className="flex-grow p-2 px-3 rounded-md bg-white">{props.question.answer4}</div>
      </div>
      <label htmlFor="questionDifficulty" className="flex gap-2"><Icons.ScaleIcon className="h-6 w-6" /> Difficulty: </label>
      <input name="questionDifficulty" title="Question Difficulty" type="range" min={1} max={10} value={props.question.difficulty} readOnly/>
      <div className="flex gap-2"><Icons.TagIcon className="h-6 w-6" /> Tags:</div>
      {/* TODO ADD TAGS */}
      <div>None</div>
    </div>
  )
}
