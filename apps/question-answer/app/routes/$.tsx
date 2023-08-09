import { redirect } from "@remix-run/node"

export const loader = () => {
  console.log('redirecting to /')
  return redirect('/')
}
