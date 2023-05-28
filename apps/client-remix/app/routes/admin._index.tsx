import { ActionArgs, LinksFunction, LoaderArgs, V2_MetaFunction, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import * as QuestionAdmin from "~/components/QuestionAdmin"
import { auth } from "~/services/auth.server"
import { managementClient } from "~/services/auth0management.server"
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

  const questions = await db.question.findMany({
    where: {
      state: "pending"
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

  if (QuestionAdmin.formName === formName) {
    const authResult = await auth.isAuthenticated(request, {
      failureRedirect: "/"
    })
    const profile = authResult?.profile
    if (typeof profile?.id !== 'string') {
      return null
    }

    const { questionId } = QuestionAdmin.getFormData(formDataEntries)
    const userRoles = await managementClient.getUserRoles({ id: profile.id })
    if (!userRoles.some(r => r.name === 'approver')) {
      throw new Error(`You attempted to aprove question: ${questionId} but you (user: ${profile.id}) is not an approver`)
    }

    const question = await db.question.update({
      where: {
        id: questionId
      },
      data: {
        state: "approved"
      }
    })

    console.log({ question })

    return { question }
  }

  return null
}

export default function AdminIndexRoute() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <>
      <h1 className="text-3xl py-2">({loaderData.questions.length}) Questions Pending Approval</h1>
      {loaderData.questions.length === 0
        ? <>
          No Questions
        </>
        : loaderData.questions.map(question => {
          return <QuestionAdmin.Component key={question.id} question={question as any} />
        })}
    </>
  )
}
