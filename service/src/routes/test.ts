import fastify from "fastify"
import * as util from "../utilities"

export default function (fastify: fastify.FastifyInstance, pluginOptions: unknown, done) {
    fastify.get(
        "/",
        async () => {
            return util.encryptTime()
        })

    done()
}