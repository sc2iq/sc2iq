import tmi from 'tmi.js'

export type Document = {
    id: string
    text: string
}

export type Error = {
    code: string
    message: string
}

export type MessageUserPairs = {
    message: string
    user: tmi.ChatUserstate
}