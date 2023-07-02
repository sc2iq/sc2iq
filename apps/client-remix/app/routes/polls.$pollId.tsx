import { createClerkClient } from "@clerk/remix/api.server"
import * as Icons from "@heroicons/react/24/solid"
import { ActionArgs, DataFunctionArgs, V2_MetaFunction, json, redirect } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import { ErrorBoundaryComponent } from "~/components/ErrorBoundary"
import PollDetails from "~/components/PollDetails"
import { db } from "~/services/db.server"

export const loader = async ({ params }: DataFunctionArgs) => {
  const { pollId } = params
  const poll = await db.poll.findFirstOrThrow({
    where: {
      id: pollId
    }
  })

  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY
  })
  const pollCreator = await clerkClient.users.getUser(poll.createdBy)

  return json({
    poll,
    pollCreator,
  })
}

export const meta: V2_MetaFunction = ({ matches, data, params }) => {
  const parentTitle = (matches as any[])
    .find(m => m.id === 'root')
    .meta.find((m: any) => m.title)
    .title

  return [{ title: `${parentTitle} - Poll: ${params?.questionId}` }]
}

const pollDetailDeleteFormName = "pollDetailDelete"

export const action = async ({ request }: ActionArgs) => {
  const rawForm = await request.formData()
  const formDataEntries = Object.fromEntries(rawForm)
  const formName = formDataEntries.formName as string

  if (formName === pollDetailDeleteFormName) {
    const pollId = formDataEntries.pollId as string
    const deletedpoll = await db.poll.delete({ where: { id: pollId } })

    return redirect('/polls')
  }

  return null
}

export const ErrorBoundary = ErrorBoundaryComponent

export default function PollsPollRoute() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <>
      <PollDetails
        poll={loaderData.poll}
        createdBy={loaderData.pollCreator as any}
      />
      <div>
        <Form method="post">
          <input type="hidden" name="formName" value={pollDetailDeleteFormName} />
          <input type="hidden" name="pollId" value={loaderData.poll.id} />
          <button className="border px-4 py-2 flex gap-2 items-center bg-red-600 text-white rounded-lg" type="submit"><Icons.XMarkIcon className="h-5 w-5" /> Delete</button>
        </Form>
      </div>
    </>
  )
}
