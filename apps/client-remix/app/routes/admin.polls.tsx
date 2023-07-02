import { createClerkClient } from "@clerk/remix/api.server"
import { getAuth } from "@clerk/remix/ssr.server"
import { ActionArgs, LinksFunction, LoaderArgs, V2_MetaFunction, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { ErrorBoundaryComponent } from "~/components/ErrorBoundary"
import * as PollAdmin from "~/components/PollAdmin"
import { db } from "~/services/db.server"

export const links: LinksFunction = () => [
]

export const meta: V2_MetaFunction = ({ matches }) => {
  const rootTitle = (matches as any[]).find(m => m.id === 'root').meta.find((m: any) => m.title).title
  return [{ title: `${rootTitle} - Admin` }]
}

export const loader = async (args: LoaderArgs) => {
  const polls = await db.poll.findMany({
    where: {
      state: "pending"
    }
  })

  return json({
    polls,
  })
}

export const action = async (args: ActionArgs) => {
  const { userId } = await getAuth(args)
  if (!userId) {
    return null
  }

  const rawForm = await args.request.formData()
  const formDataEntries = Object.fromEntries(rawForm)
  const formName = formDataEntries.formName as string

  if (PollAdmin.formName === formName) {
    const { pollId } = PollAdmin.getFormData(formDataEntries)
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY
    })
    const organizationMemberships = await clerkClient.users.getOrganizationMembershipList({ userId })
    if (!organizationMemberships.some(m => m.role === "admin")) {
      throw new Error(`You attempted to aprove poll: ${pollId} but you (user: ${userId}) is not an approver`)
    }

    const poll = await db.poll.update({
      where: {
        id: pollId
      },
      data: {
        state: "approved"
      }
    })

    console.log({ poll })

    return { poll }
  }

  return null
}

export const ErrorBoundary = ErrorBoundaryComponent

export default function AdminPollsRoute() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <>
      <h1 className="text-3xl py-2">({loaderData.polls.length}) Polls Pending Approval</h1>
      {loaderData.polls.length === 0
        ? <>
          No Polls
        </>
        : loaderData.polls.map(poll => {
        return <PollAdmin.Component key={poll.id} poll={poll as any} />
      })}
    </>
  )
}
