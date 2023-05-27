import { ActionArgs, LoaderArgs, V2_MetaFunction, json, redirect } from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import Question from "~/components/Question"
import * as SearchForm from "~/components/SearchForm"
import { auth, getSession } from "~/services/auth.server"
import { db } from "~/services/db.server"

type LoaderError = { message: string } | null

export const loader = async ({ request }: LoaderArgs) => {
  const authResult = await auth.isAuthenticated(request)
  const profile = authResult?.profile
  const session = await getSession(request.headers.get("Cookie"))
  const error = session.get(auth.sessionErrorKey) as LoaderError

  try {
    const questions = await db.question.findMany()

    return json({
      profile,
      error,
      questions,
    })
  }
  catch (e) {
    throw new Error(`Error attempting to load items. It is likely that the database was asleep.\n\nThis is likely the first request to wake it up. Please try again in a few minutes.\n\n${e}`)
  }
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
    const authResult = await auth.isAuthenticated(request)
    const profile = authResult?.profile
    if (typeof profile?.id !== 'string') {
      return null
    }

    const searchInput = SearchForm.getFormData(formDataEntries)

    if (searchInput.difficultyMax < searchInput.difficultyMin) {
      return {
        name: formName,
        error: `You attempted to search for questions with max difficulty less min difficulty which would return 0 results. Please increase max or lower min difficult and try again.`
      }
    }

    // TODO: Remove as any
    const queryString = new URLSearchParams(rawForm as URLSearchParams).toString()
    console.log({ queryString, searchInput })

    return redirect(`?search=${queryString}`)
  }

  return null
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const hasProfile = loaderData.profile !== null && typeof loaderData.profile === 'object'

  return (
    <div>
      <h1 className="text-center font-semibold text-3xl py-2">Welcome to SC2IQ</h1>
      {!hasProfile
        && (<>
          {loaderData.error ? <div>{loaderData.error.message}</div> : null}
          <div className="center">
            <Form method="post" action="/auth">
              <button type="submit" className="px-5 py-3 border border-slate-700 bg-slate-400 rounded-md text-lg my-2">Log In</button>
            </Form>
          </div>
        </>)}

      <SearchForm.Component />
      <h1 className="font-semibold text-2xl py-2">Questions:</h1>
      <div className="flex flex-col gap-8">
        {loaderData.questions.map(question => {
          return <Question
            key={question.id}
            question={question}
            error={(actionData as any)?.error}
          />
        })}
      </div>
    </div>
  )
}
