import { User } from "@clerk/remix/api.server"
import * as Icons from "@heroicons/react/24/solid"
import { Question } from "@prisma/client"
import { Link } from "@remix-run/react"

type Props = {
  // TODO: Find way to use SerializeObject<UndefinedToOptional<Question>>
  question: Omit<Question, 'createdAt' | 'updatedAt'> & { createdAt: string, updatedAt: string }
  createdBy: User
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'full',
  timeStyle: 'long'
})

export default function Component(props: Props) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="flex gap-2 items-center text-lg font-semibold">{props.question.question}</h2>
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
      <div className="flex gap-4">
        <div className="flex gap-2 items-center w-40"><Icons.ScaleIcon className="h-6 w-6 text-slate-600" /> Difficulty: </div>
        <input className="flex-grow p-2 px-3 rounded-md bg-white" name="questionDifficulty" title="Question Difficulty" type="range" min={1} max={10} value={props.question.difficulty} readOnly />
      </div>
      <div className="flex gap-4">
        <div className="flex gap-2 items-center w-40"><Icons.TagIcon className="h-6 w-6 text-slate-600" /> Tags: </div>
        {/* TODO ADD TAGS */}
        <div>None</div>
      </div>
      <div className="flex gap-4">
        <div className="flex gap-2 items-center w-40"><Icons.UserCircleIcon className="h-6 w-6 text-slate-500" /> Created By: </div>
        <div className="flex-grow py-2 rounded-md"><Link to={`/users/${props.createdBy.id}`} className="underline underline-offset-2">{props.createdBy.username ?? props.createdBy.firstName ?? props.createdBy.id}</Link></div>
      </div>
      <div className="flex gap-4">
        <div className="flex gap-2 items-center w-40"><Icons.ClockIcon className="h-6 w-6 text-slate-500" /> Created At: </div>
        <div className="flex-grow py-2 rounded-md">{dateFormatter.format(new Date(props.question.createdAt))}</div>
      </div>
    </div>
  )
}
