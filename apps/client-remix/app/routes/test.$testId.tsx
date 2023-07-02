import { LinksFunction, LoaderArgs, V2_MetaFunction, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { ErrorBoundaryComponent } from "~/components/ErrorBoundary"
import * as TestForm from "~/components/TestForm"
import { db } from "~/services/db.server"

export const links: LinksFunction = () => [
]

export const meta: V2_MetaFunction = ({ matches }) => {
  const rootTitle = (matches as any[])
    .find(m => m.id === 'root').meta
    .find((m: any) => m.title).title

  return [{ title: `${rootTitle} - Test` }]
}

export const loader = async ({ request, params }: LoaderArgs) => {
  const questions = await db.question.findMany({
    where: {
      state: "approved"
    },
    take: 10,
  })
  const test = await db.test.findUnique({
    where: {
      id: params.testId
    }
  })

  return json({
    test,
    questions,
  })
}

export const ErrorBoundary = ErrorBoundaryComponent

export default function TestRoute() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <>
      <h1>Test</h1>
      <TestForm.Component
        questions={loaderData.questions as any}
        questionIndex={0}
      />
    </>
  )
}
