import { ActionArgs, LinksFunction, LoaderArgs, V2_MetaFunction, json, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import Question from "~/components/Question"
import * as QuestionForm from "~/components/QuestionForm"
import { auth } from "~/services/auth.server"
import { db } from "~/services/db.server"

export const links: LinksFunction = () => [
]

export const meta: V2_MetaFunction = ({ matches }) => {
  const rootTitle = (matches as any[]).find(m => m.id === 'root').meta.find((m: any) => m.title).title
  return [{ title: `${rootTitle} - Questions` }]
}

export const loader = async ({ request }: LoaderArgs) => {
  const authResult = await auth.isAuthenticated(request)
  const profile = authResult?.profile
  const questions = await db.question.findMany({
    where: {
      state: "approved"
    }
  })

  return json({
    profile,
    questions,
  })
}

export const action = async ({ request }: ActionArgs) => {
  const rawForm = await request.formData()
  const formDataEntries = Object.fromEntries(rawForm)
  const formName = formDataEntries.formName as string

  if (QuestionForm.formName === formName) {
    const authResult = await auth.isAuthenticated(request)
    const profile = authResult?.profile
    if (typeof profile?.id !== 'string') {
      return null
    }

    const { question, tags} = QuestionForm.getFormData(formDataEntries)
    question.createdBy = profile.id

    console.log({ question, tags })
    // TODO: Remove as any
    const newQuestion = await db.question.create({
      data: question as any
    })

    return redirect(`?questionId=${question.id}`)
  }

  return null
}

export default function QuestionsRoute() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <>
      <QuestionForm.Component />
      <h1 className="text-2xl">Questions</h1>
      {loaderData.questions.map(question => {
        return <Question key={question.id} question={question} />
      })}
    </>
  )
}
