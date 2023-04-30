import type { ActionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"

import { auth } from "~/services/auth.server"

export const loader = async () => redirect("/")

export const action = async ({ request }: ActionArgs) => {
    return auth.authenticate("auth0", request)
}
