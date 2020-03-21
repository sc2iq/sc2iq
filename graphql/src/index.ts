import { ApolloServer } from 'apollo-server'
import context, { getDb } from './context'
import schema from './schema'

{
    (async () => {
        const db = await getDb()
        const server = new ApolloServer({
            schema,
            engine: {
                apiKey: process.env.ENGINE_API_KEY,
            },
            introspection: true,
            playground: true,
            context: ({ req }: any) => context({ req }, db),
        })

        const port = process.env.PORT || 4000
        const serverInfo = await server.listen(port)
        const { url } = serverInfo
        console.log(`🚀  Server ready at ${url} !`);
    })()
}