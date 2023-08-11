import { MicrophoneIcon } from "@heroicons/react/24/solid"
import { cssBundleHref } from "@remix-run/css-bundle"
import type { LinksFunction } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  V2_MetaFunction,
} from "@remix-run/react"
import stylesheet from "~/styles/tailwind.css";

export const meta: V2_MetaFunction = () => {
  return [
    { charSet: "utf-8" },
    { name: "viewport", content: "width=device-width,initial-scale=1" },
    { title: "Question and Answer" },
  ]
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
]

export default function App() {
  return (
    <html lang="en" className="min-h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="min-h-full bg-slate-800 text-xl text-slate-200 flex flex-col justify-center items-center gap-8">
        <header>
          <h1 className="text-8xl text-teal-200 font-bold py-6 flex flex-row gap-4">
            <MicrophoneIcon className="w-32 h-32 text-teal-300" />
            <span>Question / Answer</span>
          </h1>
        </header>
        <main>
          <Outlet />
        </main>
        <footer>
          <p>Record audio using the <a href="https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API" target="_blank" className="underline underline-offset-4">Media Streaming API</a></p>
        </footer>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
