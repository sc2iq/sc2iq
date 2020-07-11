export type Document = {
    id: string
    text: string
}

interface Badge {
    broadcaster: string
    premium: string
}

export interface Context {
    'badge-info': string | null
    badges: Badge
    color: string | null
    'display-name': string
    emotes: null
    flag: null
    id: string
    mod: boolean
    'room-id': number
    subscriber: boolean
    'tmi-sent-ts': number
    turbo: boolean
    'user-id': string
    'user-type': null
    'emotes-raw': null
    'badge-info-raw': null
    'badges-raw': string
    username: string,
    'message-type': 'chat' | 'whisper'
}

export type Error = {
    code: string
    message: string
}