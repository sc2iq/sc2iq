import type { V2_MetaFunction } from "@remix-run/node"

export const meta: V2_MetaFunction = ({ matches }) => {
  const rootTitle = (matches as any[]).find(m => m.id === 'root').meta.find((m: any) => m.title).title
  return [{ title: `${rootTitle} - Home` }]
}

export default function Index() {
  return (
    <div>
      <h1>Welcome to SC2IQ</h1>
    </div>
  )
}
