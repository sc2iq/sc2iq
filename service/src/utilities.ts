import crypto from 'crypto'

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
const password = 'd6F3Efeq'

// make the key something other than a blank buffer
let key = Buffer.alloc(32)
key = Buffer.concat([Buffer.from(password)], key.length)

const iv = crypto.randomBytes(16)

export function encrypt(text: string): string {
    let cipher = crypto.createCipheriv(algorithm, key, iv)
    let ecrypted = cipher.update(text, 'utf8', 'hex')
    ecrypted += cipher.final('hex')
    return ecrypted
}

export function decrypt(text: string): string {
    let decipher = crypto.createDecipheriv(algorithm, key, iv)
    let dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8')
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