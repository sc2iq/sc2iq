import { json, LinksFunction, LoaderArgs, V2_MetaFunction } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import React from "react"
import { ErrorBoundaryComponent } from "~/components/ErrorBoundary"
import { UserComponent } from "~/components/User"
import { clerkClient } from "~/services/clerk"

export const links: LinksFunction = () => [
]

export const meta: V2_MetaFunction = ({ matches }) => {
  const rootTitle = (matches as any[]).find(m => m.id === 'root').meta.find((m: any) => m.title).title
  return [{ title: `${rootTitle} - Users` }]
}

export const loader = async (args: LoaderArgs) => {
  const users = await clerkClient.users.getUserList()

  return json({
    users,
  })
}

export const ErrorBoundary = ErrorBoundaryComponent

export default function UserRoute() {
  const { users } = useLoaderData<typeof loader>()

  return (
    <>
      <h1>Users</h1>
      <div className="grid grid-cols-[100px_100px_100px_minmax(900px,_1fr)_200px] gap-2">
        <div>#</div>
        <div>Image</div>
        <div>Name</div>
        <div>Email</div>
        <div>Link</div>
        {users.map((user, i) => {
          return (
            <React.Fragment key={user.id}>
              <div>{i + 1}</div>
              <UserComponent user={user as any} />
            </React.Fragment>
          )
        })}
      </div>
    </>
  )
}
