import { ActionArgs, LinksFunction, LoaderArgs, V2_MetaFunction, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import * as PollAdmin from "~/components/PollAdmin"
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

  const polls = await db.poll.findMany()

  return json({
    profile,
    polls,
  })
}

export const action = async ({ request }: ActionArgs) => {
  const rawForm = await request.formData()
  const formDataEntries = Object.fromEntries(rawForm)
  const formName = formDataEntries.formName as string

  if (PollAdmin.formName === formName) {
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
      <h1 className="text-3xl py-2">Poll Approval</h1>
      {loaderData.polls.map(poll => {
        return <PollAdmin.Component key={poll.id} poll={poll as any} />
      })}
    </>
  )
}
