import dotenv from 'dotenv'
import tmi from 'tmi.js'
import { debugInfo, debugVerbose } from './debug'
import { MessageUserPairs } from './models'
import * as TAI from '@azure/ai-text-analytics'
import fs from 'fs'
import { zip } from './utilities'

const config = dotenv.config()

const DEBUG = !!process.env.DEBUG_TMI
const channelsString = process.env.CHANNEL_NAMES ?? ''
const channels = channelsString.split(',').map(s => s.trim().toLowerCase())
debugInfo(`Channels: ${channels.join(', ')}`)

const tmiOptions = {
    identity: {
        username: process.env.BOT_USERNAME!,
        password: process.env.OAUTH_TOKEN!
    },
    channels,
    debug: DEBUG
}

const messageBatchSize = Number(process.env.MESSAGE_BATCH_SIZE)
debugInfo(`Message Batch Size: ${messageBatchSize}`)

const testAnalyticsKey = process.env.TEXT_ANALYTICS_KEY!
const textAnalyticsEndpoint = 'https://twitch-stats.cognitiveservices.azure.com/'
const textAnalyticsClient = new TAI.TextAnalyticsClient(textAnalyticsEndpoint, new TAI.AzureKeyCredential(testAnalyticsKey))

const sentimentBatches: { a: MessageUserPairs, b: TAI.AnalyzeSentimentSuccessResult }[] = []
let messageUserPairs: MessageUserPairs[] = []

async function main() {
    const client: tmi.Client = new (tmi.client as any)(tmiOptions)

    debugInfo(`Twitch Stats Bot is running...`)
    debugInfo(`TMI DEBUG option is ${DEBUG ? 'enabled' : 'disabled'}`)

    client.on('message', onMessage)
    client.on('action', onMessage)
    // client.on('cheer', onMessage)
    client.on('connecting', onConnected)
    client.on('connected', onConnected)
    client.on('hosted', onHosted)
    client.on('hosting', onHosting)
    client.on('join', onJoin)
    client.on('notice', onNotice)

    client.connect()
}

main()

function onHosted(channel: string, username: string, viewers: number, autohost: boolean) {
    debugVerbose(`onHosted`, { channel, username, viewers, autohost })
}

function onHosting(channel: string, target: string, viewers: number) {
    debugVerbose(`onHosting`, { channel, target, viewers, })
}

function onJoin(channel: string, username: string, self: boolean) {
    debugInfo(`onJoin`, { channel, username, self, })
}

function onNotice(channel: string, messageId: string, message: string) {
    debugVerbose(`onNotice`, { channel, messageId, message, })
}

// Called every time the bot connects to Twitch chat
function onConnected(addr: string, port: number) {
    debugVerbose(`* Connected to ${addr}:${port}`)
}

function onMessage(channel: string, user: tmi.ChatUserstate, message: string, self: boolean) {
    // debugVerbose(`onMessageHandler`, { channel, user, message, self })

    // Do not count message that came from own bot account.
    if (self) {
        return
    }

    if (isMessageAcceptable(message)) {
        messageUserPairs.push({ message, user })
        debugInfo(`[+${messageUserPairs.length} -${messageBatchSize - messageUserPairs.length}] ${user.mod ? 'MOD: ' : ''} ${user.username}: ${message}`)

        if (messageUserPairs.length >= messageBatchSize) {
            getSentimentOfMessages([...messageUserPairs])
            messageUserPairs = []
        }
    }
    else {
        debugVerbose(`Discard message ${user.username}: '${message}'`)
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
        debugInfo(errorResults)
        return
    }

    const sentimentSuccessResults: TAI.AnalyzeSentimentSuccessResult[] = sentimentResult as any
    const sentimentResultWithMessageUserPair = zip(muPairs, sentimentSuccessResults)
    const sortedSentimentResult = sentimentResultWithMessageUserPair.sort((a, b) => b.b.confidenceScores.positive - a.b.confidenceScores.positive)
    const messagesWithSentiment: string[] = sortedSentimentResult.map(sr => `[${sr.b.confidenceScores.positive.toFixed(2)}] ${sr.a.user.username?.padEnd(20) ?? 'unknown'}: ${sr.a.message}`)
    debugInfo(`Sentiment Result: `, JSON.stringify(messagesWithSentiment, null, 4))

    const sentimentResultJson = JSON.stringify(sortedSentimentResult, null, 4)
    fs.promises.writeFile(`sentimentBatchResult-${Date.now()}.json`, sentimentResultJson)
}

