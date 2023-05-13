import { json, LinksFunction, LoaderArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import React from "react"
import { User } from "~/components/User"
import { auth } from "~/services/auth.server"
import { managementClient } from "~/services/auth0management.server"

export const links: LinksFunction = () => [
]

export const loader = async ({ request }: LoaderArgs) => {
  const profile = await auth.isAuthenticated(request, {
    failureRedirect: "/"
  })

  const users = await managementClient.getUsers()
  const roles = await managementClient.getRoles()

  const userRoles: Record<string, any[]> = {}
  for (const role of roles) {
    if (!role?.id) {
      continue
    }

    const usersInRole = await managementClient.getUsersInRole({
      id: role.id
    })

    if (usersInRole.length > 0) {
      userRoles[role.id] = usersInRole
    }
  }

  return json({
    profile,
    users,
    roles,
    userRoles,
  })
}

export default function Profile() {
  const { profile, users } = useLoaderData<typeof loader>()

  return (
    <>
      <h1>Users</h1>
      <div className="grid grid-cols-[100px_100px_100px_minmax(900px,_1fr)_200px] gap-2">
        <div className="">#</div>
        <div>Image</div>
        <div>Name</div>
        <div>Email</div>
        <div>Link</div>
        {users.map((user, i) => {
          return (
            <React.Fragment key={user.user_id}>
              <div>{i + 1}</div>
              <User user={user as any} />
            </React.Fragment>
          )
        })}
      </div>
    </>
  )
}
