import tmi from 'tmi.js'
import * as dotenv from 'dotenv'
import * as models from './models'
import * as TAI from '@azure/ai-text-analytics'
import fs from 'fs'

dotenv.config()

const DEBUG = process.env.DEBUG === 'true'
const opts = {
    identity: {
        username: process.env.BOT_USERNAME!,
        password: process.env.OAUTH_TOKEN!
    },
    channels: [
        process.env.CHANNEL_NAME!,
    ],
    debug: DEBUG
}
const MESSAGE_BATCH_SIZE = 10

const testAnalyticsKey = process.env.TEXT_ANALYTICS_KEY!
const textAnalyticsEndpoint = 'https://twitch-stats.cognitiveservices.azure.com/'
const textAnalyticsClient = new TAI.TextAnalyticsClient(textAnalyticsEndpoint, new TAI.AzureKeyCredential(testAnalyticsKey))

type MessageUserPairs = {
    message: string
    user: models.Context
}

const sentimentBatches: { a: MessageUserPairs, b: TAI.AnalyzeSentimentSuccessResult }[] = []
let messageUserPairs: MessageUserPairs[] = []

const client = new (tmi.client as any)(opts)
client.on('message', onMessageHandler)
client.on('action', onMessageHandler)
client.on('cheer', onMessageHandler)
client.on('connecting', onConnectedHandler)
client.on('connected', onConnectedHandler)
client.on('hosted', onHosted)
client.on('hosting', onHosting)
client.on('join', onJoin)
client.on('notice', onNotice)
client.connect()

function onHosted(channel: string, username: string, viewers: number, autohost: boolean) {
    console.log(`onHosted`, { channel, username, viewers, autohost })
}

function onHosting(channel: string, target: string, viewers: number) {
    console.log(`onHosting`, { channel, target, viewers, })
}

function onJoin(channel: string, username: string, self: boolean) {
    console.log(`onJoin`, { channel, username, self, })
}

function onNotice(channel: string, messageId: string, message: string) {
    console.log(`onNotice`, { channel, messageId, message, })
}

function onMessageHandler(channel: string, user: models.Context, message: string, self: boolean) {
    // console.log(`onMessageHandler`, { channel, user, message, self })
    // console.log({ options: client.getOptions() })

    // Do not count message that came from own bot account.
    if (self) {
        return
    }

    if (isMessageAcceptable(message)) {
        messageUserPairs.push({ message, user })
        console.log(`[+${messageUserPairs.length} -${MESSAGE_BATCH_SIZE - messageUserPairs.length}] ${user.mod ? 'MOD: ' : ''} ${user.username}: ${message}`)

        if (messageUserPairs.length >= MESSAGE_BATCH_SIZE) {
            getSentimentOfMessages([...messageUserPairs])
            messageUserPairs = []
        }
    }
}

function isMessageAcceptable(message: string): boolean {
    const words = message.split(' ').filter(word => word.length > 1)

    // Exclude simple messages like 'Go Maru!!'
    if (words.length < 5) {
        return false
    }

    // Exclude long SPAM posts
    if (words.length > 40) {
        return false
    }

    return true
}

async function getSentimentOfMessages(muPairs: MessageUserPairs[]) {
    const messages = muPairs.map(mu => mu.message)
    const sentimentResult = await textAnalyticsClient.analyzeSentiment(messages)
    const errorResults = sentimentResult.filter(sr => sr.error)
    if (errorResults.length > 0) {
        console.log(errorResults)
        return
    }

    const sentimentSuccessResults: TAI.AnalyzeSentimentSuccessResult[] = sentimentResult as any
    const sentimentResultWithMessageUserPair = zip(muPairs, sentimentSuccessResults)
    const sortedSentimentResult = sentimentResultWithMessageUserPair.sort((a, b) => b.b.confidenceScores.positive - a.b.confidenceScores.positive)
    const messagesWithSentiment: string[] = sortedSentimentResult.map(sr => `[${sr.b.confidenceScores.positive.toFixed(2)}] ${sr.a.user.username.padEnd(20)}: ${sr.a.message}`)
    console.log(`Sentiment Result: `, JSON.stringify(messagesWithSentiment, null, 4))

    const sentimentResultJson = JSON.stringify(sortedSentimentResult, null, 4)
    fs.promises.writeFile(`sentimentBatchResult-${Date.now()}.json`, sentimentResultJson)
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr: string, port: number) {
    console.log(`* Connected to ${addr}:${port}`)
}


function zip<T1, T2>(xs: T1[], ys: T2[]): { a: T1, b: T2 }[] {
    if (xs.length !== ys.length) {
        throw new Error(`Arrays are not the same length. xs is ${xs.length} and ys is ${ys.length}`)
    }

    const zipped = xs.map((x, i) => {
        const y = ys[i]

        return { a: x, b: y }
    })

    return zipped
}