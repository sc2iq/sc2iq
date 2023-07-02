import { User } from '@clerk/remix/api.server'
import * as Icons from "@heroicons/react/24/solid"
import { UserMetadata } from "@prisma/client"
import { Link } from "@remix-run/react"

type Props = {
  user: UserMetadata & User
}

export function UserComponent(props: Props) {
  return (
    <>
      <img src={props.user.imageUrl} className="h-10 w-10 rounded-full" />
      <div>{props.user.username ?? props.user.firstName}</div>
      <div>{props.user.emailAddresses?.at(0)?.emailAddress}</div>
      <div>
        <Link to={`/users/${props.user.id}`} className="flex gap-2 rounded-lg px-2 py-1 bg-slate-300 hover:bg-slate-400"><Icons.IdentificationIcon className="h-6 w-6 text-slate-500 inline-block" /> View</Link>
      </div>
    </>
  )
}
