import { ActionArgs, LinksFunction, LoaderArgs, json, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import * as QuestionForm from "~/components/QuestionForm"
import { auth } from "~/services/auth.server"
import { db } from "~/services/db.server"

export const links: LinksFunction = () => [
]

export const loader = async ({ request }: LoaderArgs) => {
  const profile = await auth.isAuthenticated(request, {
    failureRedirect: "/"
  })
  const questions = await db.question.findMany()

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
    const profile = await auth.isAuthenticated(request)
    if (typeof profile?.id !== 'string') {
      return null
    }

    const questionInput = QuestionForm.getFormData(formDataEntries)
    questionInput.createdBy = profile.id

    // TODO: Remove as any
    const question = await db.question.create({
      data: questionInput as any
    })

    return redirect(`/?questionId=${question.id}`)
  }

  return null
}

export default function QuestionsRoute() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <>
      <QuestionForm.Component />
      <h1>Questions</h1>
      {loaderData.questions.map(question => {
        return <div key={question.id}>
          <h4>{question.question}</h4>
        </div>
      })}
    </>
  )
}
