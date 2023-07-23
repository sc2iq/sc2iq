import { useUser } from "@clerk/remix"
import { V2_MetaFunction } from "@remix-run/node"
import { Link } from "@remix-run/react"
import { ErrorBoundaryComponent } from "~/components/ErrorBoundary"

export const meta: V2_MetaFunction = ({ matches, params }) => {
  const rootTitle = (matches as any[]).find(m => m.id === 'root').meta.find((m: any) => m.title).title
  return [{ title: `${rootTitle} - Users - ${params?.userId}` }]
}

export const ErrorBoundary = ErrorBoundaryComponent

export default function UsersUserRoute() {
  const { user } = useUser()

  return (
    <>
      <h1><Link to="/users">Users</Link> &gt; User</h1>
      <img src={user?.imageUrl} alt="Profile Picture" className="rounded-full" />
      <dl className="grid grid-cols-[100px_minmax(900px,_1fr)]">
        <dt>Name:</dt><dd>{user?.username ?? user?.fullName}</dd>
        <dt>Email:</dt><dd>{user?.primaryEmailAddress?.emailAddress}</dd>
        <dt>Id:</dt><dd>{user?.id}</dd>
      </dl>
    </>
  )
}
