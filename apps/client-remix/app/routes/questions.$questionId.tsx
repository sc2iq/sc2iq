import { DataFunctionArgs, V2_MetaFunction, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import QuestionDetails from "~/components/QuestionDetails"
import { auth } from "~/services/auth.server"
import { db } from "~/services/db.server"

export const loader = async ({ request, params }: DataFunctionArgs) => {
  await auth.isAuthenticated(request, {
    failureRedirect: "/"
  })

  const { questionId } = params
  const question = await db.question.findFirstOrThrow({ where: {
    id: questionId
  }})

  return json({
    question,
  })
}

export const meta: V2_MetaFunction = ({ matches, data, params }) => {
  const parentTitle = (matches as any[])
    .find(m => m.id === 'root')
    .meta.find((m: any) => m.title)
    .title

  return [{ title: `${parentTitle} - Question: ${params?.questionId}` }]
}

export default function Users() {
  const loaderData = useLoaderData<typeof loader>()

  return (
      <QuestionDetails question={loaderData.question} />
  )
}
