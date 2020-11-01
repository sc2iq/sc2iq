import S from "fluent-schema"

export type AnswerInput = {
    submittedAt: string
    answerIndex: number
    questionId: string
}

export const answerSchema = S.object()
    .prop('submittedAt', S.string().required())
    .prop('answerIndex', S.number().required())
    .prop('questionId', S.string().required())

export type ScoreInput = {
    // Encrypted start time
    key: string
    answers: AnswerInput[]
}

export const scoreSchema = S.object()
    .prop('answers', S.array().required().minItems(5).items(answerSchema))
