import { LinksFunction } from "@remix-run/node"
import { V2_MetaFunction } from "@remix-run/react"
import { ErrorBoundaryComponent } from "~/components/ErrorBoundary"

export const links: LinksFunction = () => [
]

export const meta: V2_MetaFunction = ({ matches }) => {
  const rootTitle = (matches as any[]).find(m => m.id === 'root').meta.find((m: any) => m.title).title
  return [
    { title: `${rootTitle} - Feeback` }
  ]
}

export const ErrorBoundary = ErrorBoundaryComponent

export default function FeedbackRoute() {
  return (
    <>
      <h1>Feedback</h1>
    </>
  )
}
