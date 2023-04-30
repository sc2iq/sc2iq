import { LoaderArgs, V2_MetaFunction, json } from "@remix-run/node"
import { Form, Link, useLoaderData } from "@remix-run/react"
import { auth, getSession } from "~/services/auth.server"

type LoaderError = { message: string } | null

export const loader = async ({ request }: LoaderArgs) => {
  const profile = await auth.isAuthenticated(request)
  const session = await getSession(request.headers.get("Cookie"))
  const error = session.get(auth.sessionErrorKey) as LoaderError

  return json({
      profile,
      error,
  })
}

export const meta: V2_MetaFunction = ({ matches }) => {
  const rootTitle = (matches as any[]).find(m => m.id === 'root').meta.find((m: any) => m.title).title
  return [{ title: `${rootTitle} - Home` }]
}

export default function Index() {
  const { profile, error } = useLoaderData<typeof loader>()
  const hasProfile = profile !== null && typeof profile === 'object'

  return (
    <div>
      <h1>Welcome to SC2IQ</h1>
      {hasProfile
        ? <>
          <h3>Current User: <Link to={`/users/${profile.id}`}>{profile?.displayName}</Link></h3>
        </>
        : <>
          {error ? <div>{error.message}</div> : null}
          <div className="center">
            <Form method="post" action="/auth">
              <button type="submit" className="logInButton">Sign In</button>
            </Form>
          </div>
          <div>You must sign in before you play the game!</div>
        </>}
    </div>
  )
}
