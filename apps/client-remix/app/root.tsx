import { HomeIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/solid'
import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno
import {
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  V2_MetaFunction,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react"
import { V2_ErrorBoundaryComponent } from "@remix-run/react/dist/routeModules"
import styles from "./styles/tailwind.css"


export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
]

export const meta: V2_MetaFunction = () => {
  return [{ title: "SC2IQ" }]
}

export const ErrorBoundary: V2_ErrorBoundaryComponent = () => {
  const error = useRouteError()
  console.error(error)
  if (isRouteErrorResponse(error)) {
    return (
      <AppComponent>
        <h1 className="text-xl font-bold">Route Error!</h1>
        {error instanceof Error
          ? <p>{error.message}</p>
          : <p>{JSON.stringify(error)}</p>
        }
      </AppComponent>
    )
  }

  return (
    <AppComponent>
      <h1 className="text-xl font-bold">Error!</h1>
      {error instanceof Error
        ? <p>{error.message}</p>
        : <p>{JSON.stringify(error)}</p>
      }
    </AppComponent>
  )
}

export default function App() {
  return (
    <AppComponent>
      <Outlet />
    </AppComponent>
  )
}

const AppComponent: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en" className="min-h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-screen flex flex-col bg-slate-50 font-sans subpixel-antialiased">
        <header className="bg-slate-600 border-b border-b-slate-700 text-white">
          <div className="container mx-auto py-4">
            <div className="center">
              <NavLink to="/"><h1 className="text-3xl ">SC2IQ</h1></NavLink>
            </div>
            <nav className="flex gap-4 items-center">
              <NavLink className="link" to="/">
                <div className="icon"><HomeIcon className="h-10 w-10 mr-3" /></div>
                <div className="label">Home</div>
              </NavLink>
              <NavLink className="link" to="users">
                <div className="icon"><UserGroupIcon className="h-10 w-10 mr-3" /></div>
                <div className="label">Users</div>
              </NavLink>
              <NavLink className="link" to="profile">
                <div className="icon"><UserIcon className="h-10 w-10 mr-3" /></div>
                <div className="label">Profile</div>
              </NavLink>
            </nav>
          </div>
        </header>
        <main className="container mx-auto flex-1 py-6">
          {children}
        </main>
        <footer className="bg-slate-600 border-b border-b-slate-700 text-white">
          <div className="container mx-auto py-12">
            <h2 className="text-lg">References</h2>
            <ul className="list-disc ml-6">
              <li><a href="https://learn.microsoft.com/en-us/azure/machine-learning/?view=azureml-api-2" target="_blank">Azure Machine Learning</a></li>
            </ul>
          </div>
        </footer>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
