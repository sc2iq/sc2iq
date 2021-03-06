import S from "fluent-schema"

export type Input = {
    question: string
    answer1: string
    answer2: string
    answer3: string
    answer4: string
    tags: string[]
}

export const InputSchema = S.object()
    .prop('question', S.string().required())
    .prop('answer1', S.string().required())
    .prop('answer2', S.string().required())
    .prop('answer3', S.string().required())
    .prop('answer4', S.string().required())
    .prop('tags', S.array().items(S.string()))

export type Query = {
    state: string
}

export const QuerySchema = S.object()
    .prop('state', S.string())