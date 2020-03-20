import fastify from "fastify"
import * as models from "../models"
import { Question } from "../entity/Question"
import { User } from "../entity/User"
import { Tag, QuestionDetails } from "../entity"


export default function (fastify: fastify.FastifyInstance, pluginOptions: unknown, done) {
    const connection = fastify.connection

    fastify.get(
        "/",
        async () => {
            const questions = await connection.manager.find(Question)

            return questions
        })

    fastify.get(
        "/:questionId",
        async (req, res) => {
            const questionId = req.params.questionId
            const question = await connection.manager.findOne(Question, questionId, { relations: ['details'] })
            if (question === undefined) {
                res.code(404).send({
                    error: {
                        code: `Could not find Question by id: ${questionId}`
                    }
                })
            }

            return question
        })

    fastify.get(
        "/random",
        async () => {
            const questions = await connection.manager.query(`SELECT TOP 10 * FROM question WHERE (ABS(CAST((BINARY_CHECKSUM(id, NEWID())) as int)) % 100) < 30`)

            return questions
        }
    )

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
                .select("question")
                .from(Question, "question")
                .leftJoinAndSelect("question.tags", "tag")
                .leftJoinAndSelect("question.user", "user")
                .where("question.difficulty >= :minDifficulty", { minDifficulty: searchInput.minDifficulty })
                .andWhere("question.difficulty <= :maxDifficulty", { maxDifficulty: searchInput.maxDifficulty })

            if (searchInput.phrase) {
                query = query
                    .andWhere("CONTAINS(question.question, :phrase)", { phrase: searchInput.tags })
            }

            if (searchInput.tags) {
                console.log(`Search: `, { tags: searchInput.tags })
            }

            const questions = await query
                .printSql()
                .getMany()

            return questions
        }
    )


    fastify.post<unknown, unknown, unknown, models.Question.Input>(
        '/',
        {
            preValidation: [fastify.authenticate],
            schema: {
                body: models.Question.Schema
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

            const questionInput = req.body

            // Create Tag entities
            const tagEntities = questionInput.tags.map(t => {
                const tag = new Tag()
                tag.name = t
                return tag
            })

            // Create base question details
            const questionDetails = new QuestionDetails()
            await connection.manager.save(questionDetails)

            // Create question
            const questionEntity = new Question()
            questionEntity.question = questionInput.question
            questionEntity.answer1 = questionInput.answer1
            questionEntity.answer2 = questionInput.answer2
            questionEntity.answer3 = questionInput.answer3
            questionEntity.answer4 = questionInput.answer4
            questionEntity.difficulty = questionInput.difficulty
            questionEntity.source = questionInput.source
            questionEntity.tags = tagEntities
            questionEntity.user = user
            questionEntity.details = questionDetails

            const savedQuestion = await connection.manager.save(questionEntity)

            return savedQuestion
        })

    done()
}