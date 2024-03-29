import { getAuth } from "@clerk/remix/ssr.server"
import { ActionArgs, LinksFunction, LoaderArgs, V2_MetaFunction, json, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { ErrorBoundaryComponent } from "~/components/ErrorBoundary"
import Question from "~/components/Question"
import * as QuestionForm from "~/components/QuestionForm"
import * as SearchForm from "~/components/SearchForm"
import { db } from "~/services/db.server"

export const links: LinksFunction = () => [
]

export const meta: V2_MetaFunction = ({ matches }) => {
  const rootTitle = (matches as any[])
    .find(m => m.id === 'root').meta
    .find((m: any) => m.title).title

  return [{ title: `${rootTitle} - Questions` }]
}

export const loader = async (args: LoaderArgs) => {
  const questions = await db.question.findMany({
    where: {
      state: "approved"
    }
  })

  return json({
    questions,
  })
}

export const action = async (args: ActionArgs) => {
  const rawForm = await args.request.formData()
  const formDataEntries = Object.fromEntries(rawForm)
  const formName = formDataEntries.formName as string

  const { userId } = await getAuth(args)
  if (!userId) {
    return null
  }

  if (QuestionForm.formName === formName) {

    const { question, tags } = QuestionForm.getFormData(formDataEntries)
    question.createdBy = userId

    console.log({ question, tags })
    // TODO: Remove as any
    const newQuestion = await db.question.create({
      data: question as any
    })

    return redirect(`?questionId=${newQuestion.id}`)
  }

  if (SearchForm.formName === formName) {
    const searchInput = SearchForm.getFormData(formDataEntries)

    if (searchInput.difficultyMax < searchInput.difficultyMin) {
      return {
        name: formName,
        error: `You attempted to search for questions with max difficulty less min difficulty which would return 0 results. Please increase max or lower min difficult and try again.`
      }
    }

    const queryString = new URLSearchParams(searchInput as any).toString()
    console.log({ queryString, searchInput })

    return redirect(`?${queryString}`)
  }

  return null
}

export const ErrorBoundary = ErrorBoundaryComponent

export default function QuestionsRoute() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <>
      <div className="flex flex-col gap-6">
        <QuestionForm.Component />
        <SearchForm.Component />
        <h1 className="text-2xl">Questions</h1>
        <div className="flex flex-col gap-8">
          {loaderData.questions.length === 0
            ? <>No Questions</>
            : loaderData.questions.map(question => {
              return <Question
                key={question.id}
                question={question}
              />
            })}
        </div>
      </div>
    </>
  )
}
