import fastify from "fastify"
import * as models from "../models"
import { Answer } from "../entity/Answer"
import { Score } from "../entity/Score"
import { User } from "../entity/User"
import { Question } from "../entity"
import * as utils from "../utilities"

export default function (fastify: fastify.FastifyInstance, pluginOptions: unknown, done) {
    const connection = fastify.connection

    fastify.get(
        "/",
        async () => {
            // const scores = await connection.manager.find(Score, { relations: ['answers', 'answers.question', 'answers.question.details'] })
            const scores = await connection.manager.find(Score)

            return scores
        })

    fastify.get(
        `/:scoreId`,
        async (req, res) => {
            const scoreId = req.params.scoreId
            const score = await connection.manager.findOne(Score, scoreId)
            if (score === undefined) {
                res.code(404).send({
                    error: {
                        code: `Could not find Score by id: ${scoreId}`
                    }
                })
            }

            return score
        })

    fastify.post<unknown, unknown, unknown, models.Score.ScoreInput>(
        '/',
        {
            preValidation: [fastify.authenticate],
            schema: {
                body: models.Score.scoreSchema
            }
        },
        async (req, res) => {
            const scoreInput = req.body

            const user = await connection.manager.findOneOrFail(User, req.user.sub)

            const questionIds = scoreInput.answers.map(a => a.questionId)
            const questions = await connection.manager.findByIds(Question, questionIds, { relations: ['details'] })

            const startTime = utils.decryptTime(scoreInput.key)

            const answerEntities = scoreInput.answers.map((a, i) => {
                const question = questions.find(q => q.id === a.questionId)

                // Compute points for answer
                const prevTime = i === 0
                    ? startTime
                    : new Date(a.submittedAt)

                const submittedAt = new Date(a.submittedAt)
                const duration = submittedAt.getTime() - prevTime.getTime()

                const expectedDuration = utils.getExpectedDuration(question.difficulty, user.points)
                const multiplier = duration / expectedDuration
                const points = multiplier * question.difficulty

                const answerEntity = new Answer()
                answerEntity.answerIndex = a.answerIndex
                answerEntity.submittedAt = new Date(a.submittedAt)
                answerEntity.question = question
                answerEntity.points = points
                answerEntity.expectedDuration = expectedDuration

                return answerEntity
            })

            const scoreEntity = new Score()
            scoreEntity.startedAt = startTime
            scoreEntity.answers = answerEntities
            scoreEntity.user = user

            const savedScore = await connection.manager.save(scoreEntity)

            return savedScore
        })

    done()
}