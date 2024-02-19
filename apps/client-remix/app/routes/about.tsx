import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node"
import { Link, useActionData, useLoaderData } from "@remix-run/react"
import { ErrorBoundaryComponent } from "~/components/ErrorBoundary"


export const loader = async ({ request }: LoaderArgs) => {
  return null
}

export const meta: V2_MetaFunction = ({ matches }) => {
  const rootTitle = (matches as any[]).find(m => m.id === 'root').meta.find((m: any) => m.title).title
  return [{ title: `${rootTitle} - About` }]
}

export const action = async ({ request }: ActionArgs) => {
  const rawForm = await request.formData()
  const formDataEntries = Object.fromEntries(rawForm)
  const formName = formDataEntries.formName as string

  return null
}


export const ErrorBoundary = ErrorBoundaryComponent

export default function IndexRoute() {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <>
      <div className="grid grid-flow-row auto-cols-[minmax(_1fr, 20em)] gap-x-[10em] gap-y-[2em]">
        <div>
          <h2 className="font-semibold text-3xl py-2">What is SC2IQ?</h2>
          <p className="leading-7">
            SC2IQ attempts to improve how feedback is collected from the community.<br />
            We measure knowledge of the game to weigh the opinions.<br />
            The premise is that the more knowlege you have about a subject the more value your opinion should hold.<br />
            This metrics allows amplifying the signal of knowledgable players from the noise less knowledage players
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-3xl py-2">How do I use SC2IQ?</h2>
          <p className="leading-7">
            1. Study <Link to="/questions" className="underline underline-offset-2">questions</Link> to learn about Starcraft<br />
            2. Take <Link to="/test" className="underline underline-offset-2">tests</Link> to establish your StarCraft 2 Intelligence metric and collect Votes!<br />
            3. Vote on <Link to="/polls" className="underline underline-offset-2">polls</Link> influence discussion and perhaps balance changes!
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-3xl py-2">How is SC2IQ calculated?</h2>
          <p className="leading-7">
            Lorem Ipsum
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-3xl py-2">How are Votes awarded?</h2>
          <ul>
            <li>Taking Tests</li>
            <li>Your questions are approved</li>
          </ul>
        </div>
      </div>
    </>
  )
}
