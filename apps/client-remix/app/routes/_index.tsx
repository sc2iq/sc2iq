import { ActionArgs, LoaderArgs, V2_MetaFunction, json } from "@remix-run/node"
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react"
import { ErrorBoundaryComponent } from "~/components/ErrorBoundary"
import { auth, getSession } from "~/services/auth.server"

type LoaderError = { message: string } | null

export const loader = async ({ request }: LoaderArgs) => {
  const authResult = await auth.isAuthenticated(request)
  const profile = authResult?.profile
  const session = await getSession(request.headers.get("Cookie"))
  const error = session.get(auth.sessionErrorKey) as LoaderError

  try {
    return json({
      profile,
      error,
    })
  }
  catch (e) {
    throw new Error(`Error attempting to load items. It is likely that the database was asleep.\n\nThis is likely the first request to wake it up. Please try again in a few minutes.\n\n${e}`)
  }
}

export const meta: V2_MetaFunction = ({ matches }) => {
  const rootTitle = (matches as any[]).find(m => m.id === 'root').meta.find((m: any) => m.title).title
  return [{ title: `${rootTitle} - Home` }]
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
  const hasProfile = loaderData.profile !== null && typeof loaderData.profile === 'object'

  return (
    <>
      {loaderData.error
        && (
          <>
            <h1>Error:</h1>
            <div>{loaderData.error.message}</div>
          </>)}
      {hasProfile
        ? (<>
          <h1 className="text-center font-semibold text-3xl py-2">Welcome back, {loaderData.profile?.displayName}!</h1>
          <h1 className="font-semibold text-3xl py-2">Personal Stats</h1>
          <div className="flex flex-col gap-2 font-semibold text-2xl">
            <div className="flex gap-4">
              <div>SC2IQ:</div>
              <div>3492</div>
            </div>
            <div className="flex gap-4">
              <div>Votes:</div>
              <div>3</div>
            </div>
          </div>
        </>)
        : (<>
          <h1 className="text-center font-semibold text-3xl py-2">Welcome to SC2IQ!</h1>
          <div className="flex justify-center">
            <Form method="post" action="/auth">
              <button type="submit" className="px-5 py-4 border border-slate-500 bg-slate-400 rounded-md text-4xl font-semibold my-4">Log In</button>
            </Form>
          </div>
          <div className="grid grid-flow-col gap-6">
            <div>
              <h2 className="font-semibold text-3xl py-2">What is SC2IQ?</h2>
              <p className="leading-7">
                SC2IQ attempts to improve the way feedback is collected from the community.<br />
                We measure knowledge of the game to weigh the opinions.<br />
                The premise is that the more knowlege you have about a subject the more value your opinion should hold.<br />
                This metrics allows amplifying the signal of knowledgable players from the noise less knowledage players
              </p>
            </div>
            <div>
              <h2 className="font-semibold text-3xl py-2">How do I use SC2IQ?</h2>
              <p className="leading-7">
                1. Study <Link to="questions" className="underline underline-offset-2">questions</Link> to learn about Starcraft<br />
                2. Take <Link to="test" className="underline underline-offset-2">tests</Link> to establish your StarCraft 2 Intelligence metric and collect Votes!<br />
                3. Vote on <Link to="polls" className="underline underline-offset-2">polls</Link> influence discussion and perhaps balance changes!
              </p>
            </div>
          </div>
        </>)}

      <>

        <h1 className="font-semibold text-3xl py-2">Recently Added Questions:</h1>
        <div className="flex flex-col gap-2 text-2xl">
          Lorem Ipsum
        </div>
        <h1 className="font-semibold text-3xl py-2">Recently Added Polls:</h1>
        <div className="flex flex-col gap-2 text-2xl">
          Lorem Ipsum
        </div>
      </>
    </>
  )
}
