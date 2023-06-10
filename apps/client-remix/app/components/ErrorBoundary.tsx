import { Link, isRouteErrorResponse, useRouteError } from "@remix-run/react"
import { V2_ErrorBoundaryComponent } from "@remix-run/react/dist/routeModules"

export const ErrorBoundaryComponent: V2_ErrorBoundaryComponent = () => {
  const error = useRouteError()
  console.error(error)

  if (isRouteErrorResponse(error)) {
    return (
      <>
        <h1 className="text-xl font-bold">Route Error!</h1>
        <div>
          <Link to="/" className="block px-5 py-3 border border-slate-700 bg-slate-400 rounded-md text-lg my-2">Go Home!</Link>
        </div>
        <pre><code>{JSON.stringify(error, null, 4)}</code></pre>
      </>
    )
  }

  return (
    <>
      <h1 className="text-xl font-bold">Error!</h1>
      {error instanceof Error
        ? <pre>{error.message}</pre>
        : <pre><code>{JSON.stringify(error, null, 4)}</code></pre>
      }
    </>
  )
}
