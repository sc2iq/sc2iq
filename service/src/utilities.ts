import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

export function getNumberInRange(max: number, min: number = 0) {
    if (max < min) {
        throw new Error(`Max ${max} must be greater than min ${min}`)
    }

    const range = Math.floor(max) - Math.floor(min)
    const valueInRange = Math.floor(Math.random() * range)
    const value = valueInRange + min

    return value
}

// TODO: Get expected duration from Question Details, changes over time?
// Cause different points for question depending on when you answer. 🤔
// Expected duration could be based on user and average time spend on question
export function getExpectedDuration(difficulty: number, userPoints: number): number {
    return Math.round(500 + (Math.random() * 50) - 25)
}

const algorithm = 'aes-256-ctr'
const password = process.env.CIHPER_PASSWORD
if (!password) {
    throw new Error(`No CIPHER_PASSWORD defined.`)
}

let key = Buffer.alloc(32)
key = Buffer.concat([Buffer.from(password)], key.length)
const iv = crypto.randomBytes(16)
const inputEncoding = 'utf8'
const outputEncoding = 'hex'

export function encrypt(text: string): string {
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let ecrypted = cipher.update(text, inputEncoding, outputEncoding)
    ecrypted += cipher.final(outputEncoding)
    return ecrypted
}

export function decrypt(text: string): string {
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    let dec = decipher.update(text, outputEncoding, inputEncoding)
    dec += decipher.final(inputEncoding)
    return dec
}


const separator = '|'
export function encryptTime(): string {
    const time = new Date().toJSON()
    return encrypt(`${time}${separator}${time}`)
}

export function decryptTime(encryptedTime: string): Date {
    const decryptedTime = decrypt(encryptedTime)
    const [timeString] = decryptedTime.split(separator)
    return new Date(timeString)
}