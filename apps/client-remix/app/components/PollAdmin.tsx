import * as Icons from "@heroicons/react/24/solid"
import { Poll } from "@prisma/client"
import { Form, Link } from "@remix-run/react"

type Props = {
  poll: Poll
}

export const formName = "poll:approve"

export function Component(props: Props) {
  return (
    <div>
      <h2>Question: {props.poll.question}</h2>
      <div>Answer 1: {props.poll.answer1}</div>
      <div>Answer 2: {props.poll.answer2}</div>
      <div>Answer 3: {props.poll.answer3}</div>
      <div>Answer 4: {props.poll.answer4}</div>
      <div>State: {props.poll.state}</div>
      <div>Created By: <Link className="text-slate-600 hover:underline" to={`/users/${props.poll.createdBy}`}>{props.poll.createdBy}</Link></div>
      <div>Created At: {new Date(props.poll.createdAt as any).toLocaleString('en-us')}</div>
      <div>Updated At: {new Date(props.poll.updatedAt as any).toLocaleString('en-us')}</div>

      <Form method="post" className="">
        <input type="hidden" name="formName" value={formName} />
        <button className="border px-4 py-2 flex gap-2 items-center bg-slate-600 text-slate-100 rounded-lg" type="submit"><Icons.CheckIcon className="h-5 w-5" /> Approve</button>
      </Form>
    </div>
  )
}
