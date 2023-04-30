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
          <div className="container mx-auto flex gap-x-4 justify-between items-center py-8">
            <NavLink to="/"><h1 className="text-3xl ">SC2IQ</h1></NavLink>
          </div>
          <nav>
            <NavLink className="link" to="/">
              <div className="icon"><span className="material-symbols-outlined">home</span></div>
              <div className="label">Home</div>
            </NavLink>
                <NavLink className="link" to="profile">
                  <div className="icon"><span className="material-symbols-outlined">account_circle</span></div>
                  <div className="label">Profile</div>
                </NavLink>
          </nav>
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
