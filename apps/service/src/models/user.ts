import S from "fluent-schema"

export type UserInput = {
    name: string
    reputation?: number
    status?: string
}

export const Schema = S.object()
    .prop('name', S.string().required())
    .prop('reputation', S.number())
    .prop('status', S.string())

