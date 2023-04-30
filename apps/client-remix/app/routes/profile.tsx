import { json, LinksFunction, LoaderArgs } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
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

export default function Profile() {
  const { profile } = useLoaderData<typeof loader>()

  return (
    <>
      <h1>Profile</h1>
      <div className="profile">
        <img src={profile.photos?.at(0)?.value} alt="Profile Picture" className="profilePicture" />
        <Form method="post" action="/logout">
          <button type="submit" className="profileLogOutButton">Sign Out</button>
        </Form>

        <div>
          <h2>{profile?._json?.nickname ?? profile?.displayName ?? profile.name?.familyName}</h2>
          <p>{profile.emails?.at(0)?.value}</p>
        </div>
      </div>
    </>
  )
}
