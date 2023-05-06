import { LinksFunction } from "@remix-run/node"

export const links: LinksFunction = () => [
]

export default function FeedbackRoute() {
  return (
    <>
      <h1>Feedback</h1>
      <div className="feedback">
      </div>
    </>
  )
}
