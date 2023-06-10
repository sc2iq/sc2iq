import * as Icons from "@heroicons/react/24/solid"
import { Poll } from "@prisma/client"
import { Link } from "@remix-run/react"

type Props = {
  // TODO: Find way to use SerializeObject<UndefinedToOptional<Poll>>
  poll: Omit<Poll, 'createdAt' | 'updatedAt'> & { createdAt: string, updatedAt: string }
}

export default function Component(props: Props) {
  return (
    <div className="border p-5 rounded-xl flex flex-col gap-2 bg-slate-200 border-slate-300">
      <h2 className="flex gap-2 items-center text-2xl py-2">
        <span className="font-semibold">{props.poll.question}</span>
        <Link to={`/polls/${props.poll.id}`} className="flex gap-2 items-center ml-auto p-1 px-2 bg-slate-300 rounded-md text-lg text-slate-600"><Icons.QuestionMarkCircleIcon className="h-6 w-6 text-slate-400 inline-block" /> View Details</Link>
      </h2>
      <div className="flex gap-4">
        <div className="flex gap-2 items-center w-10"><Icons.CheckIcon className="h-6 w-6 text-slate-600" /> 1: </div>
        <div className="flex-grow rounded-md p-2 px-3 bg-white">{props.poll.answer1}</div>
        <button className="rounded-md p-2 px-3 bg-slate-400 text-slate-50 hover:bg-slate-500 hover:text-white">Vote!</button>
      </div>
      <div className="flex gap-4">
        <div className="flex gap-2 items-center w-10"><Icons.XMarkIcon className="h-6 w-6 text-slate-600" /> 2: </div>
        <div className="flex-grow p-2 px-3 rounded-md bg-white">{props.poll.answer2}</div>
        <button className="rounded-md p-2 px-3 bg-slate-400 text-slate-50 hover:bg-slate-500 hover:text-white">Vote!</button>
      </div>
      <div className="flex gap-4">
        <div className="flex gap-2 items-center w-10"><Icons.XMarkIcon className="h-6 w-6 text-slate-600" /> 3: </div>
        <div className="flex-grow p-2 px-3 rounded-md bg-white">{props.poll.answer3}</div>
        <button className="rounded-md p-2 px-3 bg-slate-400 text-slate-50 hover:bg-slate-500 hover:text-white">Vote!</button>
      </div>
      <div className="flex gap-4">
        <div className="flex gap-2 items-center w-10"><Icons.XMarkIcon className="h-6 w-6 text-slate-600" /> 4: </div>
        <div className="flex-grow p-2 px-3 rounded-md bg-white">{props.poll.answer4}</div>
        <button className="rounded-md p-2 px-3 bg-slate-400 text-slate-50 hover:bg-slate-500 hover:text-white">Vote!</button>
      </div>
      <div className="flex gap-4 items-center">
        <div className="flex gap-2 items-center w-40">
          <Icons.TagIcon className="h-6 w-6 text-slate-600" />
          <div>Tags:</div>
        </div>
        {/* TODO ADD TAGS */}
        <div>None</div>
      </div>
    </div>
  )
}
