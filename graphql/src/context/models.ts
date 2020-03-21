import mongo from 'mongodb'
// import * as types from '../generated/types'

export interface IContext {
    db: mongo.Db,
    questions: mongo.Collection<any>
    polls: mongo.Collection<any>
    users: mongo.Collection<any>
    user: any
}