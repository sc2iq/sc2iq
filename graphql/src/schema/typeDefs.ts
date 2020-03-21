import global from './global/typeDefs'
import questions from './questions/typeDefs'
import users from './users/typeDefs'

const typeDefs = [
    ...global,
    questions,
    users,
]

export default typeDefs