import { DataFunctionArgs, V2_MetaFunction, json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { managementClient } from "~/services/auth0management.server"

export const loader = async ({ request, params }: DataFunctionArgs) => {
  const { userId } = params
  const user = await managementClient.getUser({ id: userId! })

  return json({
    user,
  })
}

export const meta: V2_MetaFunction = ({ matches, data }) => {
  const rootTitle = (matches as any[]).find(m => m.id === 'root').meta.find((m: any) => m.title).title
  return [{ title: `${rootTitle} - Users - ${data.user?.nickname}` }]
}

export default function UsersUserRoute() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <>
      <h1><Link to="/users">Users</Link> &gt; User</h1>
      <img src={user.picture} alt="Profile Picture" className="rounded-full" />
      <dl className="grid grid-cols-[100px_minmax(900px,_1fr)]">
        <dt>Name:</dt><dd>{user.nickname}</dd>
        <dt>Email:</dt><dd>{user.email}</dd>
        <dt>Id:</dt><dd>{user.user_id}</dd>
      </dl>
    </>
  )
}
