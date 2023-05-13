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
        <Link to={`/users/${props.user.user_id}`} className="bg-slate-300 rounded-lg px-2 py-1">View</Link>
      </div>
    </>
  )
}
