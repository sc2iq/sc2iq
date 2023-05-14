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
import { Role } from "auth0"
import { Auth0Profile } from 'remix-auth-auth0'
import { managementClient } from "~/services/auth0management.server"
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
        <div>
          <Link to="/" className="block px-5 py-3 border border-slate-700 bg-slate-400 rounded-md text-lg my-2">Go Home!</Link>
        </div>
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
        ? <pre>{error.message}</pre>
        : <pre><code>{JSON.stringify(error, null, 4)}</code></pre>
      }
    </AppComponent>
  )
}

export const loader = async ({ request }: LoaderArgs) => {
  const profile = await auth.isAuthenticated(request)
  let userRoles: Role[] | undefined = undefined

  if (profile?.id) {
    userRoles = await managementClient.getUserRoles({ id: profile.id })
  }

  return json({
    profile,
    userRoles,
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
    profile: Auth0Profile | null,
    userRoles?: Role[]
  }
}

const AppComponent: React.FC<React.PropsWithChildren<Props>> = ({ data, children }) => {
  const navLinkClassNameFn = (isLoggedIn: boolean) => ({ isActive, isPending }: { isPending: boolean, isActive: boolean }) => {
    let classes = "flex flex-col gap-1 p-3 px-5 items-center rounded-md border"
    if (!isActive && !isLoggedIn) {
      classes += " text-slate-400 cursor-not-allowed"
    }
    if (isPending) {
      classes += " bg-slate-600 border-slate-600"
    }
    else if (isActive) {
      classes += " bg-slate-500 border-slate-500 text-amber-300"
    }
    else {
      classes += " border-transparent"
      if (isLoggedIn) {
        classes += " hover:bg-slate-500/40"
      }
    }

    return classes
  }

  const isLoggedIn = Boolean(data?.profile)
  const userRole = data?.userRoles?.at(0)?.name

  return (
    <html lang="en" className="min-h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-screen flex flex-col bg-slate-50 font-sans subpixel-antialiased">
        <header className="sticky top-0 bg-slate-600 border-b border-b-slate-700 text-slate-200">
          <div className="container mx-auto py-4 flex flex-col gap-2">
            <h1 className="text-6xl text-center font-semibold mb-4"><NavLink to="/">StarCraft 2 Intelligence Quotient</NavLink></h1>
            <nav className="flex gap-5 items-end">
              <NavLink className={(...args) => navLinkClassNameFn(true)(...args)} to="/" end>
                <Icons.HomeIcon className="h-8 w-8" />
                <div>Home</div>
              </NavLink>
              <NavLink className={(...args) => navLinkClassNameFn(true)(...args)} to="questions">
                <Icons.ChatBubbleBottomCenterTextIcon className="h-8 w-8" />
                <div>Questions</div>
              </NavLink>
              <NavLink className={(...args) => navLinkClassNameFn(isLoggedIn)(...args)} to="test">
                <Icons.TrophyIcon className="h-8 w-8" />
                <div>Test</div>
              </NavLink>
              <NavLink className={(...args) => navLinkClassNameFn(isLoggedIn)(...args)} to="polls">
                <Icons.ChatBubbleLeftRightIcon className="h-8 w-8" />
                <div>Polls</div>
              </NavLink>
              <NavLink className={(...args) => navLinkClassNameFn(isLoggedIn)(...args)} to="users">
                <Icons.UserGroupIcon className="h-8 w-8" />
                <div>Users</div>
              </NavLink>
              <NavLink className={(...args) => navLinkClassNameFn(isLoggedIn)(...args)} to="profile">
                <Icons.UserIcon className="h-8 w-8" />
                <div>Profile</div>
              </NavLink>
              <NavLink className={(...args) => navLinkClassNameFn(isLoggedIn)(...args)} to="feedback">
                <Icons.PencilSquareIcon className="h-8 w-8" />
                <div>Feeback</div>
              </NavLink>
              {userRole === "admin" && (
                <NavLink className={(...args) => navLinkClassNameFn(isLoggedIn)(...args)} to="admin">
                  <Icons.ShieldExclamationIcon className="h-8 w-8" />
                  <div>Admin</div>
                </NavLink>
              )}
              <Link to="profile" style={{ marginLeft: 'auto' }} className='flex flex-row items-end text-right gap-4'>
                {data?.profile && (
                  <>
                    <div>
                      <div>{userRole}</div>
                      <div>{data.profile.displayName}</div>
                    </div>
                    <img src={data.profile.photos?.at(0)?.value} alt="Profile Picture" className="h-16 w-16 rounded-full border border-slate-800 shadow-lg" />
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
