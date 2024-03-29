import * as Icons from "@heroicons/react/24/solid"
import { Question } from "@prisma/client"
import { Form, Link } from "@remix-run/react"
import z from "zod"
import { FormDataEntries } from "~/types"

type Props = {
  question: Question
}

export const formName = "question:approve"

export const schema = z.object({
  questionId: z.string(),
})

export function getFormData(formDataEntries: FormDataEntries): { questionId: string } {
  const questionFormData = schema.parse(formDataEntries)

  return {
    questionId: questionFormData.questionId,
  }
}

export function Component(props: Props) {
  return (
    <div>
      <h2>Question: {props.question.question}</h2>
      <div>Answer 1: {props.question.answer1}</div>
      <div>Answer 2: {props.question.answer2}</div>
      <div>Answer 3: {props.question.answer3}</div>
      <div>Answer 4: {props.question.answer4}</div>
      <div>Difficulty: {props.question.difficulty}</div>
      <div>Tags: []</div>
      <div>Created By: <Link className="text-slate-600 hover:underline" to={`/users/${props.question.createdBy}`}>{props.question.createdBy}</Link></div>
      <div>Created At: {new Date(props.question.createdAt as any).toLocaleString('en-us')}</div>
      <div>Updated At: {new Date(props.question.updatedAt as any).toLocaleString('en-us')}</div>


      <Form method="post" className="">
        <input type="hidden" name="formName" value={formName} />
        <input type="hidden" name="questionId" value={props.question.id} />
        <button className="border px-4 py-2 flex gap-2 items-center bg-slate-600 text-slate-100 rounded-lg" type="submit"><Icons.CheckIcon className="h-5 w-5" /> Approve</button>
      </Form>
    </div>
  )
}
