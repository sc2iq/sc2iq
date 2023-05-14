import { json, LinksFunction, LoaderArgs } from "@remix-run/node"
import { Form, useLoaderData, V2_MetaFunction } from "@remix-run/react"
import { Role } from "auth0"
import { auth } from "~/services/auth.server"
import { managementClient } from "~/services/auth0management.server"

export const links: LinksFunction = () => [
]

export const meta: V2_MetaFunction = ({ matches, data }) => {
  const rootTitle = (matches as any[]).find(m => m.id === 'root').meta.find((m: any) => m.title).title
  return [{ title: `${rootTitle} - Profile - ${data.profile?._json?.nickname}` }]
}

export const loader = async ({ request }: LoaderArgs) => {
  const profile = await auth.isAuthenticated(request, {
    failureRedirect: "/"
  })
  let userRoles: Role[] | undefined = undefined

  if (profile?.id) {
    userRoles = await managementClient.getUserRoles({ id: profile.id })
  }

  return json({
    profile,
    userRoles,
  })
}

export default function ProfileRoute() {
  const loaderData = useLoaderData<typeof loader>()
  const { profile, userRoles } = loaderData

  return (
    <>
      <h1>Profile</h1>
      <img src={profile.photos?.at(0)?.value} alt="Profile Picture" className="rounded-full" />
      <Form method="post" action="/logout">
        <button type="submit" className="px-5 py-3 border border-slate-700 bg-slate-400 rounded-md text-lg my-2">Sign Out</button>
      </Form>

      <dl className="grid grid-cols-[100px_minmax(900px,_1fr)]">
        <dt>Name:</dt>
        <dd>{profile?._json?.nickname ?? profile?.displayName ?? profile.name?.familyName}</dd>
        <dt>Email</dt>
        <dd>{profile?.emails?.at(0)?.value}</dd>
        <dt>Roles:</dt>
        <dd>{userRoles?.map(userRole => <>Role: {userRole.name} Description: {userRole.description}</>)}</dd>
      </dl>
    </>
  )
}
