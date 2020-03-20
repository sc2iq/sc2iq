import path from "path"
import fastify from "fastify"
import fp from "fastify-plugin"
import * as TORM from "typeorm"

const ormPlugin: fastify.Plugin<unknown, unknown, unknown, unknown> = async (instance, pluginOptions, done) => {
    const connectionOptions = await TORM.getConnectionOptions()
    if (connectionOptions.type !== "mssql") {
        throw Error(`Connection options type did not match database type.`)
    }

    const connection = await TORM.createConnection({
        type: connectionOptions.type,
        host: connectionOptions.host,
        username: connectionOptions.username,
        password: connectionOptions.password,
        database: connectionOptions.database,

        synchronize: true,
        // dropSchema: true,
        logging: ["error"],
        entities: [
            path.join(__dirname, "../entity/**/*")
        ],
        migrations: [
            path.join(__dirname, "../migration/**/*")
        ],
        options: {
            "encrypt": true
        }
    })

    instance
        .decorate('connection', connection)
    // .addHook('onClose', async (instance2, done) => {
    //     await instance2.connection.close()
    //     done()
    // })

    done()
}

declare module 'fastify' {
    export interface FastifyInstance {
        connection: TORM.Connection
        authenticate: FastifyMiddleware
    }
}

export default fp(ormPlugin)