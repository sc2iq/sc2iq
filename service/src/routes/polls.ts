import fastify from "fastify"
import * as models from "../models"
import { PollState, Poll } from "../entity/Poll"
import { User } from "../entity/User"
import { Tag, PollDetails } from "../entity"

export default function (fastify: fastify.FastifyInstance, pluginOptions: unknown, done) {
    const connection = fastify.connection

    fastify.get(
        "/",
        {
            schema: {
                querystring: models.Poll.QuerySchema,
            },
        },
        async (req) => {
            const pollState = (req.query.state as string)?.toLowerCase() ?? PollState.APPROVED
            const polls = await connection.manager.find(Poll, { where: { state: pollState }})

            return polls
        })

    fastify.get(
        "/:pollId",
        async (req, res) => {
            const pollId = req.params.pollId
            const poll = await connection.manager.findOne(Poll, pollId, { relations: ['details'] })
            if (poll === undefined) {
                res.code(404).send({
                    error: {
                        code: `Could not find Poll by id: ${pollId}`
                    }
                })
            }

            return poll
        })

    fastify.get(
        "/random",
        async () => {
            const polls = await connection.manager.query(`SELECT TOP 10 * FROM poll WHERE (ABS(CAST((BINARY_CHECKSUM(id, NEWID())) as int)) % 100) < 30`)

            return polls
        }
    )

    
    fastify.put(
        `/:pollId/approve`,
        async (req, res) => {
            const pollId = req.params.pollId
            const poll = await connection.manager.findOne(Poll, pollId)
            if (poll === undefined) {
                res.code(404).send({
                    error: {
                        code: `Could not find Poll by id: ${pollId}`
                    }
                })
            }

            poll.state = PollState.APPROVED

            return await connection.manager.save(poll)
        })

    fastify.put(
        `/:pollId/reject`,
        async (req, res) => {
            const pollId = req.params.pollId
            const poll = await connection.manager.findOne(Poll, pollId)
            if (poll === undefined) {
                res.code(404).send({
                    error: {
                        code: `Could not find Poll by id: ${pollId}`
                    }
                })
            }

            poll.state === PollState.REJECTED

            return await connection.manager.save(poll)
        })

    fastify.post<unknown, unknown, unknown, models.Search.Input>(
        '/search',
        {
            schema: {
                body: models.Search.Schema,
            },
        },
        async (req) => {
            const searchInput = req.body

            let query = connection
                .createQueryBuilder()
                .select("poll")
                .from(Poll, "poll")
                .leftJoinAndSelect("poll.tags", "tag")
                .leftJoinAndSelect("poll.user", "user")

            if (searchInput.phrase) {
                query = query
                    .andWhere("CONTAINS(poll.question, :phrase)", { phrase: searchInput.phrase })
            }

            if (searchInput.tags) {
                console.log(`Search: `, { tags: searchInput.tags })
            }

            const polls = await query
                .printSql()
                .getMany()

            return polls
        }
    )


    fastify.post<unknown, unknown, unknown, models.Poll.Input>(
        '/',
        {
            preValidation: [fastify.authenticate],
            schema: {
                body: models.Poll.InputSchema
            }
        },
        async (req, res) => {
            const userId = req.user.sub
            const user = await connection.manager.findOne(User, userId)
            if (user === undefined) {
                res.code(404).send({
                    error: {
                        code: `Could not find user by id: ${userId}`
                    }
                })
                return
            }

            const pollInput = req.body

            // Create Tag entities
            const tagEntities = pollInput.tags.map(t => {
                const tag = new Tag()
                tag.name = t
                return tag
            })

            // Create base question details
            const pollDetails = new PollDetails()
            await connection.manager.save(pollDetails)

            // Create question
            const pollEntity = new Poll()
            pollEntity.question = pollInput.question
            pollEntity.answer1 = pollInput.answer1
            pollEntity.answer2 = pollInput.answer2
            pollEntity.answer3 = pollInput.answer3
            pollEntity.answer4 = pollInput.answer4
            pollEntity.tags = tagEntities
            pollEntity.user = user
            pollEntity.details = pollDetails

            const savedPoll = await connection.manager.save(pollEntity)

            return savedPoll
        })

    done()
}