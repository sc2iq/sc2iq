import { getAuth } from "@clerk/remix/ssr.server"
import { ActionArgs, LinksFunction, LoaderArgs, V2_MetaFunction, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { ErrorBoundaryComponent } from "~/components/ErrorBoundary"
import * as QuestionAdmin from "~/components/QuestionAdmin"
import { clerkClient } from "~/services/clerk"
import { db } from "~/services/db.server"

export const links: LinksFunction = () => [
]

export const meta: V2_MetaFunction = ({ matches }) => {
  const rootTitle = (matches as any[]).find(m => m.id === 'root').meta.find((m: any) => m.title).title
  return [{ title: `${rootTitle} - Admin` }]
}

export const loader = async ({ request }: LoaderArgs) => {
  const questions = await db.question.findMany({
    where: {
      state: "pending"
    }
  })

  return json({
    questions,
  })
}

export const action = async (args: ActionArgs) => {
  const rawForm = await args.request.formData()
  const formDataEntries = Object.fromEntries(rawForm)
  const formName = formDataEntries.formName as string

  if (QuestionAdmin.formName === formName) {
    const { userId } = await getAuth(args)
    if (!userId) {
      return null
    }

    const { questionId } = QuestionAdmin.getFormData(formDataEntries)
    const organizationMemberships = await clerkClient.users.getOrganizationMembershipList({ userId })
    if (!organizationMemberships.some(m => m.role === "admin")) {
      throw new Error(`You attempted to aprove question: ${questionId} but you (user: ${userId}) is not an approver`)
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

export const ErrorBoundary = ErrorBoundaryComponent

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
