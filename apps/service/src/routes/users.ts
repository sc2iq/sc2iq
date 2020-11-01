import fastify from 'fastify'
import * as models from "../models"
import { User } from "../entity/User"

export default function (fastify: fastify.FastifyInstance, pluginOptions: unknown, done) {
    const connection = fastify.connection

    fastify.get(
        "/",
        async (req, res) => {
            const users = await connection.manager.find(User)

            return users
        })

    fastify.get(
        `/:userId`,
        async (req, res) => {
            const userId = req.params.userId
            const user = await connection.manager.findOne(User, userId)
            if (user === undefined) {
                res.code(404).send({
                    error: {
                        code: `Could not find User by id: ${userId}`
                    }
                })
            }

            return user
        })

    fastify.get(
        `/:userId/scores`,
        async (req) => {
            const userId = req.params.userId
            const user = await connection.manager.findOne(User, userId, { relations: ['scores'] })

            return {
                scores: user.scores,
            }
        }
    )

    fastify.get(
        `/:userId/questions`,
        async (req) => {
            const userId = req.params.userId
            const user = await connection.manager.findOne(User, userId, { relations: ['questions'] })

            return {
                questions: user.questions,
            }
        }
    )

    fastify.post<unknown, unknown, unknown, models.User.UserInput>(
        "/",
        {
            preValidation: [fastify.authenticate],
            schema: {
                body: models.User.Schema
            }
        },
        async (req, res) => {
            const userId = req.user.sub
            const existingUser = await connection.manager.findOne(User, userId)
            if (existingUser) {
                return existingUser
            }

            const user = req.body

            const userEntity = new User()
            userEntity.id = userId
            userEntity.name = user.name

            if (user.reputation) {
                userEntity.reputation = user.reputation
            }
            if (user.status) {
                userEntity.status = user.status
            }

            const savedUser = await connection.manager.save(userEntity)

            return savedUser
        })

    done()
}