import { ActionArgs, LinksFunction, LoaderArgs, V2_MetaFunction, json, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import Poll from "~/components/Poll"
import * as PollForm from "~/components/PollForm"
import * as SearchForm from "~/components/SearchForm"
import { auth } from "~/services/auth.server"
import { db } from "~/services/db.server"

export const links: LinksFunction = () => [
]

export const meta: V2_MetaFunction = ({ matches }) => {
  const rootTitle = (matches as any[]).find(m => m.id === 'root').meta.find((m: any) => m.title).title
  return [{ title: `${rootTitle} - Polls` }]
}

export const loader = async ({ request }: LoaderArgs) => {
  const authResult = await auth.isAuthenticated(request)
  const profile = authResult?.profile
  const polls = await db.poll.findMany({
    where: {
      state: "approved"
    }
  })

  return json({
    profile,
    polls,
  })
}

export const action = async ({ request }: ActionArgs) => {
  const rawForm = await request.formData()
  const formDataEntries = Object.fromEntries(rawForm)
  const formName = formDataEntries.formName as string

  if (PollForm.formName === formName) {
    const authResult = await auth.isAuthenticated(request)
    const profile = authResult?.profile
    if (typeof profile?.id !== 'string') {
      return null
    }

    const pollInput = PollForm.getFormData(formDataEntries)
    pollInput.createdBy = profile.id

    // TODO: Remove as any
    const poll = await db.poll.create({
      data: pollInput as any
    })

    return redirect(`?pollId=${poll.id}`)
  }

  return null
}

export default function PollsRoute() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <>
      <PollForm.Component />
      <SearchForm.Component />
      <h1 className="text-2xl">Polls</h1>
      <div className="flex flex-col gap-8">
        {loaderData.polls.length === 0
          ? <>No Polls</>
          : loaderData.polls.map(poll => {
          return <Poll
            key={poll.id}
            poll={poll}
          />
        })}
      </div>
    </>
  )
}