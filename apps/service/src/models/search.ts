import S from "fluent-schema"

export type Input = {
    phrase: string
    tags: string[]
    minDifficulty: number
    maxDifficulty: number
}

export const Schema = S.object()
    .prop('phrase', S.string())
    .prop('tags', S.array().items(S.string()))
    .prop('minDifficulty', S.number())
    .prop('maxDifficulty', S.number())