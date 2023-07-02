import { getAuth } from "@clerk/remix/ssr.server"
import { ActionArgs, LinksFunction, LoaderArgs, V2_MetaFunction, json, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { ErrorBoundaryComponent } from "~/components/ErrorBoundary"
import Poll from "~/components/Poll"
import * as PollForm from "~/components/PollForm"
import * as SearchForm from "~/components/SearchForm"
import { db } from "~/services/db.server"

export const links: LinksFunction = () => [
]

export const meta: V2_MetaFunction = ({ matches }) => {
  const rootTitle = (matches as any[]).find(m => m.id === 'root').meta.find((m: any) => m.title).title
  return [{ title: `${rootTitle} - Polls` }]
}

export const loader = async (args: LoaderArgs) => {
  const polls = await db.poll.findMany({
    where: {
      state: "approved"
    }
  })

  return json({
    polls,
  })
}

export const action = async (args: ActionArgs) => {
  const rawForm = await args.request.formData()
  const formDataEntries = Object.fromEntries(rawForm)
  const formName = formDataEntries.formName as string

  if (PollForm.formName === formName) {
    const { userId } = await getAuth(args)
    if (!userId) {
      return null
    }

    const pollInput = PollForm.getFormData(formDataEntries)
    pollInput.createdBy = userId

    // TODO: Remove as any
    const poll = await db.poll.create({
      data: pollInput as any
    })

    return redirect(`?pollId=${poll.id}`)
  }

  return null
}

export const ErrorBoundary = ErrorBoundaryComponent

export default function PollsRoute() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <>
      <div className="flex flex-col gap-6">
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
      </div>
    </>
  )
}
