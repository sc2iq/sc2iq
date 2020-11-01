import { gql } from 'apollo-server'

const typeDefs = gql`
    input UserInput {
        email: String!
        name: String!
    }

    type User {
        id: String!
        email: String!
        name: String!
    }

    extend type Query {
        users: [User!]!
    }

    extend type Mutation {
        addUser(userInput: UserInput): [User!]!
    }
`

export default typeDefs