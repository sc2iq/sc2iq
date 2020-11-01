import { gql } from 'apollo-server'

const typeDefs = gql`
    input QuestionInput {
        text: String!
        answers: [String!]!
        tags: [String]
        difficulty: Float!
        authorId: String!
    }

    type Question {
        id: String!
        text: String!
        answers: [String!]!
        tags: [String]
        difficulty: Float!
        authorId: String!
        avgCorrect: Float!
        lastUpdated: String!
    }

    extend type Query {
        questions(ignored: String): [Question]!
    }

    extend type Mutation {
        addQuestion(questionInput: QuestionInput): Question!
    }
`
export default typeDefs