import { useUser } from "@clerk/remix"
import { LinksFunction } from "@remix-run/node"
import { Form, V2_MetaFunction } from "@remix-run/react"
import { ErrorBoundaryComponent } from "~/components/ErrorBoundary"

export const links: LinksFunction = () => [
]

export const meta: V2_MetaFunction = ({ matches, data }) => {
  const rootTitle = (matches as any[]).find(m => m.id === 'root').meta.find((m: any) => m.title).title
  return [{ title: `${rootTitle} - Profile - ${data.profile?._json?.nickname}` }]
}

export const ErrorBoundary = ErrorBoundaryComponent

export default function ProfileRoute() {
  const { user } = useUser()

  const displayName = user?.fullName ?? user?.username ?? user?.primaryEmailAddress?.emailAddress ?? user?.primaryPhoneNumber?.phoneNumber ?? user?.id ?? "Unknown User"

  return (
    <>
      <img src={user?.imageUrl} alt="Profile Picture" className="border-4 border-slate-600 rounded-full h-60 w-60 my-5" />
      <Form method="post" action="/logout">
        <button type="submit" className="px-5 py-3 border border-slate-700 bg-slate-400 rounded-md text-lg my-2">Sign Out</button>
      </Form>

      <dl className="grid grid-cols-[100px_minmax(900px,_1fr)]">
        <dt>Name:</dt>
        <dd>{displayName}</dd>
        <dt>Email</dt>
        <dd>{user?.primaryEmailAddress?.emailAddress}</dd>
        <dt>Roles:</dt>
        <dd>{user?.organizationMemberships?.map(membership =>
          <div>
            <div>Role: {membership.role}</div>
          </div>)}
        </dd>
      </dl>
    </>
  )
}
