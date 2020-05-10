import S from "fluent-schema"

export type Input = {
    id?: string
    question: string
    answer1: string
    answer2: string
    answer3: string
    answer4: string
    difficulty: number
    source: string
    tags: string[]
}

export const InputSchema = S.object()
    .prop('id', S.string())
    .prop('question', S.string().required())
    .prop('answer1', S.string().required())
    .prop('answer2', S.string().required())
    .prop('answer3', S.string().required())
    .prop('answer4', S.string().required())
    .prop('difficulty', S.number().required())
    .prop('source', S.string().required())
    .prop('tags', S.array().items(S.string()))

export type Query = {
    status: string
}

export const QuerySchema = S.object()
    .prop('state', S.string())