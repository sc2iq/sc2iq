import * as Icons from '@heroicons/react/24/solid'
import { LinksFunction, LoaderArgs, json } from "@remix-run/node"; // or cloudflare/deno
import {
  Link,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  V2_MetaFunction,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react"
import { V2_ErrorBoundaryComponent } from "@remix-run/react/dist/routeModules"
import { Auth0Profile } from 'remix-auth-auth0'
import { auth } from './services/auth.server'
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
          : <pre><code>{JSON.stringify(error, null, 4)}</code></pre>
        }
      </AppComponent>
    )
  }

  return (
    <AppComponent>
      <h1 className="text-xl font-bold">Error!</h1>
      {error instanceof Error
        ? <p>{error.message}</p>
        : <pre><code>{JSON.stringify(error, null, 4)}</code></pre>
      }
    </AppComponent>
  )
}

export const loader = async ({ request }: LoaderArgs) => {
  const profile = await auth.isAuthenticated(request)

  return json({
    profile,
  })
}

export default function App() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <AppComponent data={loaderData}>
      <Outlet />
    </AppComponent>
  )
}

// TODO: Find way to use typeof loader
type Props = {
  data?: {
    profile: Auth0Profile | null
  }
}

const AppComponent: React.FC<React.PropsWithChildren<Props>> = ({ data, children }) => {
  const navLinkClassNameFn = ({ isActive, isPending }: { isPending: boolean, isActive: boolean }) => {
    let classes = "flex flex-col gap-1 p-3 items-center rounded-md border"
    if (isPending) {
      classes += " bg-slate-500"
    }
    else if (isActive) {
      classes += " bg-slate-400 border-slate-700"
    }
    else {
      classes += " border-transparent"
    }

    return classes
  }

  return (
    <html lang="en" className="min-h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-screen flex flex-col bg-slate-50 font-sans subpixel-antialiased">
        <header className="sticky top-0 bg-slate-600 border-b border-b-slate-700 text-white">
          <div className="container mx-auto py-4 flex flex-col gap-2">
            <div className="text-center">
              <h1 className="text-4xl font-semibold"><NavLink to="/">SC2IQ</NavLink></h1>
            </div>
            <nav className="flex gap-8 items-end">
              <NavLink className={navLinkClassNameFn} to="/">
                <Icons.HomeIcon className="h-8 w-8" />
                <div>Home</div>
              </NavLink>
              <NavLink className={navLinkClassNameFn} to="questions">
                <Icons.ChatBubbleBottomCenterTextIcon className="h-8 w-8" />
                <div>Questions</div>
              </NavLink>
              <NavLink className={navLinkClassNameFn} to="test">
                <Icons.TrophyIcon className="h-8 w-8" />
                <div>Test</div>
              </NavLink>
              <NavLink className={navLinkClassNameFn} to="polls">
                <Icons.ChatBubbleLeftRightIcon className="h-8 w-8" />
                <div>Polls</div>
              </NavLink>
              <NavLink className={navLinkClassNameFn} to="users">
                <Icons.UserGroupIcon className="h-8 w-8" />
                <div>Users</div>
              </NavLink>
              <NavLink className={navLinkClassNameFn} to="profile">
                <Icons.UserIcon className="h-8 w-8" />
                <div>Profile</div>
              </NavLink>
              <NavLink className={navLinkClassNameFn} to="feedback">
                <Icons.PencilSquareIcon className="h-8 w-8" />
                <div>Feeback</div>
              </NavLink>
              <Link to="profile" style={{ marginLeft: 'auto' }} className='flex flex-row items-end gap-4'>
                {data?.profile && (
                  <>
                    {data.profile.displayName}
                    <img src={data.profile.photos?.at(0)?.value} alt="Profile Picture" className="h-12 w-12 rounded-full" />
                  </>
                )}
              </Link>
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
