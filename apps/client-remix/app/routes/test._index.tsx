import { ActionArgs, LinksFunction, LoaderArgs, V2_MetaFunction, redirect } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import { auth } from "~/services/auth.server"

export const links: LinksFunction = () => [
]

export const meta: V2_MetaFunction = ({ matches }) => {
  const rootTitle = (matches as any[])
    .find(m => m.id === 'root').meta
    .find((m: any) => m.title).title

  return [{ title: `${rootTitle} - Test` }]
}

export const loader = async ({ request }: LoaderArgs) => {
  return null
}

const formNameTestStart = "testStart"

export const action = async ({ request }: ActionArgs) => {

  const rawForm = await request.formData()
  const formDataEntries = Object.fromEntries(rawForm)
  const formName = formDataEntries.formName as string

  if (formNameTestStart === formName) {
    const authResult = await auth.isAuthenticated(request)
    const profile = authResult?.profile
    const test = {
      id: 'asdfa',
    }

    const urlParams = {
      userId: profile?.id ?? '',
    }

    const queryString = new URLSearchParams(urlParams).toString()
    console.log({ queryString })

    return redirect(`/test/${test.id}?${queryString}`)
  }

  return null
}


export default function TestRoute() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <>
      <h1>Test</h1>
      <h2>Start</h2>
      <div className="flex justify-center">
        <Form method="post">
          <input type="hidden" name="formName" value={formNameTestStart} />
          <button type="submit" className="px-5 py-4 border border-slate-500 bg-slate-400 rounded-md text-4xl font-semibold my-4">Start!</button>
        </Form>
      </div>
    </>
  )
}
