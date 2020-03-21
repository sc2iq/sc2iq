import uuid from 'uuid/v4'
import * as types from '../../generated/types'

const Query: types.QueryResolvers.Resolvers = {
    questions: async (_, { }, context, info) => {
        const cursor = await context.questions.find().limit(10)
        const questions = await cursor.toArray()

        return questions
    },
}

const Mutation: types.MutationResolvers.Resolvers = {
    addQuestion: async (_, { questionInput }, context) => {
        if (!questionInput) {
            throw Error(`questionInput not defined`)
        }

        const question: types.Question = {
            id: uuid(),
            text: 'My Fake Question',
            tags: [],
            difficulty: 1.4,
            answers: [],
            authorId: '',
            avgCorrect: 1,
            lastUpdated: new Date().toJSON()
        }

        const questionResult = await context.questions.insertOne(question)

        return question
    },
}

export default {
    Query,
    Mutation,
}