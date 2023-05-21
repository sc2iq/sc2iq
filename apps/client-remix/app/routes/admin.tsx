import { ActionArgs, LinksFunction, LoaderArgs, V2_MetaFunction } from "@remix-run/node"
import { NavLink, Outlet } from "@remix-run/react"

export const links: LinksFunction = () => [
]

export const meta: V2_MetaFunction = ({ matches }) => {
  const rootTitle = (matches as any[]).find(m => m.id === 'root').meta.find((m: any) => m.title).title
  return [{ title: `${rootTitle} - Admin` }]
}

export const loader = async ({ request }: LoaderArgs) => {
  return null
}

export const action = async ({ request }: ActionArgs) => {

}

export default function AdminRoute() {
  const navLinkClassNameFn = ({ isActive, isPending }: { isPending: boolean, isActive: boolean }) => {
    let classes = "p-4 py-2 text-xl bg-slate-300 rounded-md"
    if (isActive) {
      classes += " bg-slate-500 border-slate-500 text-slate-50"
    }

    return classes
  }

  return (
    <>
      <div className="rounded-md flex gap-2 items-center py-2">
        <NavLink className={navLinkClassNameFn} to="/admin" end>Questions</NavLink>
        <NavLink className={navLinkClassNameFn} to="/admin/polls">Polls</NavLink>
      </div>
      <Outlet />
    </>
  )
}
