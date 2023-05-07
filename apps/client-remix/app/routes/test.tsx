import { LinksFunction, LoaderArgs, json } from "@remix-run/node"
import { auth } from "~/services/auth.server"

export const links: LinksFunction = () => [
]

export const loader = async ({ request }: LoaderArgs) => {
  const profile = await auth.isAuthenticated(request, {
    failureRedirect: "/"
  })

  return json({
    profile,
  })
}

export default function TestRoute() {
  return (
    <>
      <h1>Test</h1>
    </>
  )
}
