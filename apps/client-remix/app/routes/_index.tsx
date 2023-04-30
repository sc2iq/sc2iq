import { MagnifyingGlassIcon } from "@heroicons/react/24/solid"
import { ActionArgs, LoaderArgs, V2_MetaFunction, json, redirect } from "@remix-run/node"
import { Form, Link, useLoaderData } from "@remix-run/react"
import z from "zod"
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

const formNames = {
  create: 'formNameQuestionCreate',
}
const formQuestionCreateSchema = z.object({
  question: z.string(),
  answer1: z.string(),
  answer2: z.string(),
  answer4: z.string(),
  answer3: z.string(),
})

export const action = async ({ request }: ActionArgs) => {
  const rawForm = await request.formData()
  const formData = Object.fromEntries(rawForm)
  const formName = formData.formName as string

  if (formNames.create == formName) {
    const questionInput = formQuestionCreateSchema.parse({
      question: formData.question as string,
      answer1: formData.answer1 as string,
      answer2: formData.answer2 as string,
      answer3: formData.answer3 as string,
      answer4: formData.answer4 as string,
    })
    const question = await db.question.create({
      data: {
        ...questionInput,
        answerIndex: 0,
      }
    })

    return redirect(`/?questionId=${question.id}`)
  }

  return null
}

export default function Index() {
  const { profile, error, questions } = useLoaderData<typeof loader>()
  const hasProfile = profile !== null && typeof profile === 'object'

  return (
    <div>
      <h1>Welcome to SC2IQ</h1>
      {hasProfile
        ? <>
          <h3>Current User: <Link to={`/users/${profile.id}`}>{profile?.displayName}</Link></h3>
        </>
        : <>
          {error ? <div>{error.message}</div> : null}
          <div className="center">
            <Form method="post" action="/auth">
              <button type="submit" className="logInButton">Sign In</button>
            </Form>
          </div>
          <div>You must sign in before you play the game!</div>
        </>}
      <Form method="post">
        <h1>Create</h1>
        <div>
          <label htmlFor='question'>Question: </label>
          <input type="text" placeholder='How much health does a Marine have?' id="question" name="question" required />
        </div>
        <div>
          <label htmlFor='answer1'>Answer 1: </label>
          <input type="text" id="answer1" name="answer1" required />
        </div>
        <div>
          <label htmlFor='answer2'>Answer 2: </label>
          <input type="text" id="answer2" name="answer2" required />
        </div>
        <div>
          <label htmlFor='answer3'>Answer 3: </label>
          <input type="text" id="answer3" name="answer3" required />
        </div>
        <div>
          <label htmlFor='answer4'>Answer 4: </label>
          <input type="text" id="answer4" name="answer4" required />
        </div>
        <div>
          <input type="hidden" name="formName" value={formNames.create} />
          <button type="submit">Create</button>
        </div>
      </Form>

      <h2>Search</h2>
      <MagnifyingGlassIcon className="h-10 w-10 mr-3" />
      <div>Search</div>
      <h1>Questions:</h1>
      <div>
        {questions.map(question => {
          return <div key={question.id}>
            <h4>{question.question}</h4>
          </div>
        })}
      </div>
    </div>
  )
}
