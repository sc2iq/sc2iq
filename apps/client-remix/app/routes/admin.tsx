import { ActionArgs, LinksFunction, LoaderArgs, V2_MetaFunction, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import * as QuestionAdmin from "~/components/QuestionAdmin"
import { auth } from "~/services/auth.server"
import { db } from "~/services/db.server"

export const links: LinksFunction = () => [
]

export const meta: V2_MetaFunction = ({ matches }) => {
  const rootTitle = (matches as any[]).find(m => m.id === 'root').meta.find((m: any) => m.title).title
  return [{ title: `${rootTitle} - Admin` }]
}

export const loader = async ({ request }: LoaderArgs) => {
  const authResult = await auth.isAuthenticated(request, {
    failureRedirect: "/"
  })
  const profile = authResult?.profile

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

  if (QuestionAdmin.formName === formName) {
    const authResult = await auth.isAuthenticated(request, {
      failureRedirect: "/"
    })
    const profile = authResult?.profile

    if (typeof profile?.id !== 'string') {
      return null
    }

    console.log({ formDataEntries })
  }

  return null
}

export default function AdminRoute() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <>
      <h1 className="text-2xl">Questions</h1>
      {loaderData.questions.map(question => {
        return <QuestionAdmin.Component key={question.id} question={question as any} />
      })}
    </>
  )
}
