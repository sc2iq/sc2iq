import mongo from 'mongodb'
// import * as types from '../generated/types'
import * as models from './models'
import { IContext } from './models'
import getDb from './db'


// https://www.apollographql.com/docs/apollo-server/features/authentication.html
export const context = async ({ req }: { req: any }, db: mongo.Db): Promise<IContext | Error> => {

    try {
        const questions = db.collection('questions')
        const polls = db.collection('polls')
        const users = db.collection('users')
        const user = {
            name: 'Fake User',
            id: 'id'
        }

        return {
            db,
            questions,
            polls,
            users,
            user,
        }
    }
    catch (e) {
        const error = e as Error

        return error
    }
}

export {
    IContext,
    getDb,
    models
}

export default context