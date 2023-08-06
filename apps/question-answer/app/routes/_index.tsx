import type { V2_MetaFunction } from "@remix-run/node"

export const meta: V2_MetaFunction = ({ matches }) => {
  const parentRoute = matches.find(m => (m as any)?.id === "root")
  const rootTitle = (parentRoute as any)?.meta?.find((m: any) => m.title).title

  return [
    { title: `${rootTitle} - Home` },
  ]
}

export default function Index() {
  return (
    <>
      <h1>Home</h1>
    </>
  )
}
