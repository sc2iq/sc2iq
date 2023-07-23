import { redirect } from "@remix-run/node"

export const loader = () => {
  console.warn("You are on an unknown route. Redirecting to /")
  return redirect("/")
}
