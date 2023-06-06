import { createCookieSessionStorage } from "@remix-run/node"
import { Authenticator } from "remix-auth"
import type { Auth0Profile } from "remix-auth-auth0"
import { Auth0Strategy } from "remix-auth-auth0"

import {
  AUTH0_CALLBACK_URL,
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
  AUTH0_DOMAIN,
  COOKIE_SECRET
} from "~/constants/index.server"

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

type Auth0StragegyValue = { profile: Auth0Profile, accessToken: string }

export const auth = new Authenticator<Auth0StragegyValue>(sessionStorage)

const auth0Strategy = new Auth0Strategy<Auth0StragegyValue>(
  {
    callbackURL: AUTH0_CALLBACK_URL,
    clientID: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
    domain: AUTH0_DOMAIN
  },
  async ({ profile, accessToken, refreshToken, extraParams, context }) => {
    console.log(`auth0Strategy`, { profile, accessToken, refreshToken, extraParams, context })
    return { profile, accessToken }
  }
)

auth.use(auth0Strategy)

export const { getSession, commitSession, destroySession } = sessionStorage
