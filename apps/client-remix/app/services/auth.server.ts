import { createCookieSessionStorage } from "@remix-run/node"
import { COOKIE_SECRET } from "~/constants/index.server"

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_remix_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [COOKIE_SECRET],
    secure: process.env.NODE_ENV === "production"
  }
})

export const { getSession, commitSession, destroySession } = sessionStorage
