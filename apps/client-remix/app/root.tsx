import { ClerkApp, ClerkCatchBoundary, useUser } from "@clerk/remix"
import { rootAuthLoader } from "@clerk/remix/ssr.server"
import * as Icons from '@heroicons/react/24/solid'
import { cssBundleHref } from "@remix-run/css-bundle"
import { ErrorBoundaryComponent, LinksFunction, LoaderArgs } from "@remix-run/node"
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
  useLoaderData
} from "@remix-run/react"
import tailwindStyles from "./styles/tailwind.css"

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: tailwindStyles },
]

export const meta: V2_MetaFunction = () => {
  return [
    { charset: "utf-8" },
    { viewport: "width=device-width,initial-scale=1" },
    { title: "SC2IQ" },
  ]
}

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }: any) => {
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


export const CatchBoundary = ClerkCatchBoundary()

export const loader = async (args: LoaderArgs) => {
  return rootAuthLoader(args, () => {
    return {
    }
  }, {
    loadUser: true,
  })
}

function App() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <AppComponent data={loaderData}>
      <Outlet />
    </AppComponent>
  )
}

export default ClerkApp(App)

// TODO: Find way to use typeof loader
type Props = {
  data?: {
  }
}

const AppComponent: React.FC<React.PropsWithChildren<Props>> = ({ children }) => {
  const { isSignedIn, user } = useUser()

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

  const userRoles = user?.organizationMemberships?.map(m => m.role) ?? []
  const isAdmin = userRoles.includes("admin")

  return (
    <html lang="en" className="min-h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-screen flex flex-col bg-slate-50 font-sans subpixel-antialiased">
        <header className="sticky top-0 bg-slate-600 border-b border-b-slate-700 text-slate-200">
          <div className="container mx-auto py-4 flex flex-col gap-2">
            <h1 className="text-6xl text-center font-semibold mb-4 mt-6"><NavLink to="/">StarCraft 2 Intelligence Quotient</NavLink></h1>
            <nav className="flex gap-5 items-end">
              <NavLink className={(...args) => navLinkClassNameFn(true)(...args)} to="/" end>
                <Icons.HomeIcon className="h-8 w-8" />
                <div>Home</div>
              </NavLink>
              <NavLink className={(...args) => navLinkClassNameFn(true)(...args)} to="questions">
                <Icons.ChatBubbleBottomCenterTextIcon className="h-8 w-8" />
                <div>Questions</div>
              </NavLink>
              <NavLink className={(...args) => navLinkClassNameFn(true)(...args)} to="test">
                <Icons.TrophyIcon className="h-8 w-8" />
                <div>Test</div>
              </NavLink>
              <NavLink className={(...args) => navLinkClassNameFn(true)(...args)} to="polls">
                <Icons.ChatBubbleLeftRightIcon className="h-8 w-8" />
                <div>Polls</div>
              </NavLink>
              <NavLink className={(...args) => navLinkClassNameFn(true)(...args)} to="users">
                <Icons.UserGroupIcon className="h-8 w-8" />
                <div>Users</div>
              </NavLink>
              <NavLink className={(...args) => navLinkClassNameFn(true)(...args)} to="about">
                <Icons.InformationCircleIcon className="h-8 w-8" />
                <div>About</div>
              </NavLink>
              <NavLink className={(...args) => navLinkClassNameFn(true)(...args)} to="feedback">
                <Icons.PencilSquareIcon className="h-8 w-8" />
                <div>Feeback</div>
              </NavLink>
              {isAdmin && (
                <NavLink className={(...args) => navLinkClassNameFn(Boolean(isSignedIn))(...args)} to="admin">
                  <Icons.ShieldExclamationIcon className="h-8 w-8" />
                  <div>Admin</div>
                </NavLink>
              )}
              <Link to="profile" style={{ marginLeft: 'auto' }} className='flex flex-row items-end text-right gap-4 p-3 px-5 rounded-md hover:bg-slate-500/40'>
                {userRoles.length > 0 && (
                  <>
                    <div>
                      <div>{userRoles.at(0)}</div>
                      <div>{user?.username ?? user?.fullName}</div>
                    </div>
                    <img src={user?.imageUrl} alt="Profile Picture" className="h-16 w-16 rounded-full border border-slate-800 shadow-lg" />
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
            <h2 className="text-lg">SC2IQ</h2>
            <ul className="list-disc ml-6">
              <li><a href="https://liquipedia.net/starcraft2/Unit_Statistics_(Legacy_of_the_Void)" target="_blank">Liquipedia Unit Statistics</a></li>
            </ul>
            <ul className="list-disc ml-6">
              <li><a href="https://www.unitstatistics.com/starcraft2/" target="_blank">Unit Statistics</a></li>
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
