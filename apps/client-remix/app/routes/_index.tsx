import { SignedIn, SignedOut, useUser } from "@clerk/remix"
import { ActionArgs, V2_MetaFunction } from "@remix-run/node"
import { Link, useActionData } from "@remix-run/react"
import { ErrorBoundaryComponent } from "~/components/ErrorBoundary"


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
  const { user } = useUser()
  const actionData = useActionData<typeof action>()
  const displayName = user?.fullName ?? user?.username ?? user?.emailAddresses?.at(0)?.emailAddress ?? user?.phoneNumbers?.at(0)?.phoneNumber ?? user?.id

  return (
    <>
      <SignedIn>
        <h1 className="text-center font-semibold text-3xl py-2">Welcome back, {displayName}!</h1>
        <h1 className="font-semibold text-3xl py-2">Personal Stats</h1>
        <div className="flex flex-col gap-2 text-2xl">
          <div className="flex gap-4">
            <div>SC2IQ:</div>
            <div>3492</div>
          </div>
          <div className="flex gap-4">
            <div>Votes:</div>
            <div>3</div>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <h1 className="text-center font-semibold text-3xl py-2">Welcome to SC2IQ!</h1>
        <div className="flex justify-center">
          <Link to="/sign-in" className="px-5 py-4 border border-slate-500 bg-slate-400 rounded-md text-4xl font-semibold my-4">Log In</Link>
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
        <div>
          <h2 className="font-semibold text-3xl py-2">Read More on <Link to="about" className="underline underline-offset-2">About</Link></h2>
        </div>
      </SignedOut>
      <>
        <h1 className="font-semibold text-2xl py-2">Recently Added Questions:</h1>
        <div className="flex flex-col gap-2">
          Lorem Ipsum
        </div>
        <h1 className="font-semibold text-2xl py-2">Recently Added Polls:</h1>
        <div className="flex flex-col gap-2">
          Lorem Ipsum
        </div>
      </>
    </>
  )
}
