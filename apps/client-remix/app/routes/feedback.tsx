import { LinksFunction, LoaderArgs, json } from "@remix-run/node"
import { V2_MetaFunction } from "@remix-run/react"
import { ErrorBoundaryComponent } from "~/components/ErrorBoundary"
import { auth } from "~/services/auth.server"

export const links: LinksFunction = () => [
]

export const meta: V2_MetaFunction = ({ matches }) => {
  const rootTitle = (matches as any[]).find(m => m.id === 'root').meta.find((m: any) => m.title).title
  return [{ title: `${rootTitle} - Feeback` }]
}

export const loader = async ({ request }: LoaderArgs) => {
  const authResult = await auth.isAuthenticated(request)
  const profile = authResult?.profile

  return json({
    profile,
  })
}

export const ErrorBoundary = ErrorBoundaryComponent

export default function FeedbackRoute() {
  return (
    <>
      <h1>Feedback</h1>
    </>
  )
}
