import * as Icons from "@heroicons/react/24/solid"
import { UserMetadata } from "@prisma/client"
import { Link } from "@remix-run/react"
import { User } from 'auth0'

type Props = {
  user: UserMetadata & User
}

export function User(props: Props) {
  return (
    <>
      <img src={props.user.picture} className="h-10 w-10 rounded-full" />
      <div>{props.user.nickname}</div>
      <div>{props.user.email}</div>
      <div>
        <Link to={`/users/${props.user.user_id}`} className="flex gap-2 rounded-lg px-2 py-1 bg-slate-300 hover:bg-slate-400"><Icons.IdentificationIcon className="h-6 w-6 text-slate-500 inline-block" /> View</Link>
      </div>
    </>
  )
}
