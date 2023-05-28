import * as Icons from "@heroicons/react/24/solid"
import { ActionArgs, DataFunctionArgs, V2_MetaFunction, json, redirect } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import QuestionDetails from "~/components/QuestionDetails"
import { managementClient } from "~/services/auth0management.server"
import { db } from "~/services/db.server"

export const loader = async ({ params }: DataFunctionArgs) => {
  const { questionId } = params
  const question = await db.question.findFirstOrThrow({ where: {
    id: questionId
  }})


  const user = await managementClient.getUser({ id: question.createdBy })

  return json({
    question,
    user,
  })
}

export const meta: V2_MetaFunction = ({ matches, data, params }) => {
  const parentTitle = (matches as any[])
    .find(m => m.id === 'root')
    .meta.find((m: any) => m.title)
    .title

  return [{ title: `${parentTitle} - Question: ${params?.questionId}` }]
}

export const action = async ({ request }: ActionArgs) => {
  const rawForm = await request.formData()
  const formDataEntries = Object.fromEntries(rawForm)
  const formName = formDataEntries.formName as string

  if (formName === "questionDetailDelete") {
    const questionId = formDataEntries.questionId as string
    const deletedQuestion = await db.question.delete({ where: { id: questionId }})

    return redirect('/questions')
  }

  return null
}

export default function QuestionQuestionRoute() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <>
      <QuestionDetails question={loaderData.question} createdBy={loaderData.user} />
      <div>
        <Form method="post">
          <input type="hidden" name="formName" value="questionDetailDelete" />
          <input type="hidden" name="questionId" value={loaderData.question.id} />
          <button className="border px-4 py-2 flex gap-2 items-center bg-red-600 text-white rounded-lg" type="submit"><Icons.XMarkIcon className="h-5 w-5" /> Delete</button>
        </Form>
      </div>
    </>
  )
}
