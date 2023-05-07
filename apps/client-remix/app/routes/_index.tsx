import { ActionArgs, LoaderArgs, V2_MetaFunction, json } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import * as SearchForm from "~/components/SearchForm"
import { auth, getSession } from "~/services/auth.server"
import { db } from "~/services/db.server"

type LoaderError = { message: string } | null

export const loader = async ({ request }: LoaderArgs) => {
  const profile = await auth.isAuthenticated(request)
  const session = await getSession(request.headers.get("Cookie"))
  const error = session.get(auth.sessionErrorKey) as LoaderError
  const questions = await db.question.findMany()

  return json({
    profile,
    error,
    questions,
  })
}

export const meta: V2_MetaFunction = ({ matches }) => {
  const rootTitle = (matches as any[]).find(m => m.id === 'root').meta.find((m: any) => m.title).title
  return [{ title: `${rootTitle} - Home` }]
}

export const action = async ({ request }: ActionArgs) => {
  const rawForm = await request.formData()
  const formDataEntries = Object.fromEntries(rawForm)
  const formName = formDataEntries.formName as string

  if (SearchForm.formName === formName) {

  }

  return null
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>()
  const hasProfile = loaderData.profile !== null && typeof loaderData.profile === 'object'

  return (
    <div>
      <h1>Welcome to SC2IQ</h1>
      {!hasProfile
        && (<>
          {loaderData.error ? <div>{loaderData.error.message}</div> : null}
          <div className="center">
            <Form method="post" action="/auth">
              <button type="submit" className="logInButton">Sign In</button>
            </Form>
          </div>
          <div>You must sign in before you play the game!</div>
        </>)}

      <SearchForm.Component />
      <h1>Questions:</h1>
      {loaderData.questions.map(question => {
        return <div key={question.id}>
          <h4>{question.question}</h4>
        </div>
      })}
    </div>
  )
}
