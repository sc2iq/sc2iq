import { DataFunctionArgs, json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { auth } from "~/services/auth.server"
import { managementClient } from "~/services/auth0management.server"

export const loader = async ({ request, params }: DataFunctionArgs) => {
  const { userId } = params
  await auth.isAuthenticated(request, {
    failureRedirect: "/"
  })

  const user = await managementClient.getUser({ id: userId! })

  return json({
    user,
  })
}

export default function Users() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <>
      <h1><Link to="/users">Users</Link> &gt; User</h1>
      <img src={user.picture} className="rounded-full" />
      <dl className="grid grid-cols-[100px_minmax(900px,_1fr)]">
        <dt>Name:</dt><dd>{user.nickname}</dd>
        <dt>Email:</dt><dd>{user.email}</dd>
        <dt>Id:</dt><dd>{user.user_id}</dd>
      </dl>
    </>
  )
}
