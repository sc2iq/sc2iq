import { json, LinksFunction, LoaderArgs } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import React from "react"
import { auth } from "~/services/auth.server"
import { managementClient } from "~/services/auth0management.server"

export const links: LinksFunction = () => [
]

export const loader = async ({ request }: LoaderArgs) => {
  const profile = await auth.isAuthenticated(request, {
    failureRedirect: "/"
  })

  const users = await managementClient.getUsers()

  return json({
    profile,
    users,
  })
}

export default function Profile() {
  const { profile, users } = useLoaderData<typeof loader>()

  return (
    <>
        <h1>Users</h1>
        <div className="users">
            <div>#</div><div>Image</div><div>Name</div><div>Email</div><div>Id</div><div>View</div>
            {users.map((user, i) => {
                return (
                    <React.Fragment key={user.user_id}>
                        <div>{i + 1}</div><img src={user.picture} className="userImage" /><div>{user.nickname}</div><div>{user.email}</div><div>{user.user_id}</div><Link to={`/users/${user.user_id}`}>Vew</Link>
                    </React.Fragment>
                )
            })}
        </div>
    </>
  )
}
