import "reflect-metadata"
import fastify from "fastify"
import fastifyCors from "fastify-cors"
import fastifyAuth0Verify from "fastify-auth0-verify"
import UsersRoute from './routes/users'
import QuestionsRoute from './routes/questions'
import ScoresRoute from './routes/scores'
import PollsRoute from './routes/polls'
import TestRoute from './routes/test'
import ormPlugin from './plugins/orm'

type Auth0User = {
    iss: string
    sub: string
    aud: string[]
    iat: number
    exp: number
    azp: string
    scope: string
    permissions: string[]
}

declare module 'fastify' {
    // Claims from Auth0 access token
    export interface FastifyRequest {
        user: Auth0User
    }
}

process.on('unhandledRejection', error => {
    throw error
})

const defaultPort = 3002
const port = process.env.PORT
    ? parseInt(process.env.PORT)
    : defaultPort

async function main() {

    const server = fastify({
        logger: {
            // redact: ['req.headers.authorization'],
            prettyPrint: true,
            // level: ['info']
        },
        caseSensitive: false,
    })

    server.register(fastifyAuth0Verify, {
        domain: "sc2iq.auth0.com",
        audience: "https://sc2iq.com/api",
    })

    server.register(ormPlugin)
        .after(err => {
            if (err) throw err
        })

    server.register(fastifyCors)


    server.get("/", async (req, res) => {
        return `Server is running... ${new Date().toJSON()}`
    })

    server.get('/routes', async () => {
        return server.printRoutes()
    })

    server.register(function (instance, _options, done) {
        instance.get(
            '/verify',
            {
                preValidation: [instance.authenticate]
            },
            async (req, reply) => {
                reply.send(req.user)
            })

        done()
    })

    server.register(UsersRoute, { prefix: '/users' })
    server.register(QuestionsRoute, { prefix: '/questions' })
    server.register(PollsRoute, { prefix: '/polls' })
    server.register(ScoresRoute, { prefix: '/scores' })
    server.register(TestRoute, { prefix: '/test' })

    try {
        await server.listen(port)
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}

main()
