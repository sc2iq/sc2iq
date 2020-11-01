import merge from 'lodash/merge'
import questions from './questions/resolvers'
import users from './users/resolvers'

const resolvers = merge(
    questions,
    users,
)

export default resolvers