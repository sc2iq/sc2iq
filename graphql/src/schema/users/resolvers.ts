import * as types from '../../generated/types'
import uuid from 'uuid/v4'

const Query: types.QueryResolvers.Resolvers = {
    users: async (_, { }, context) => {
        const cursor = await context.users.find().limit(10)
        const users = await cursor.toArray()

        return users
    }
}

// const Mutation: types.MutationResolvers.Resolvers = {
const Mutation: any = {
    addUser: async (_, { userInput }, context) => {
        const user: types.User = {
            ...userInput,
            id: uuid()
        }

        const userResult = await context.users.insertOne(user)

        return user
    }
}

export default {
    Query,
    Mutation,
}