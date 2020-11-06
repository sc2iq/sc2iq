import { Question } from './models'

export function randomInRange(min: number, max: number) {
    if (max < min) {
        throw new Error(`max ${max} value must be greater or equal min ${min}`)
    }

    const diff = max - min

    return min + Math.floor(Math.random() * diff)
}

export function trunc(n: number, digits: number): number {
    return Math.trunc(n * Math.pow(10, digits)) / Math.pow(10, digits)
}

export function getRandom<T>(xs: T[]): T {
    const randomIndex = randomInRange(0, xs.length - 1)
    const x = xs[randomIndex]

    return x
}

const maxIterations = 1000 * 1000
export function getRandomWhichMeetsConstraints<T>(xs: T[], isValid: (x: T) => boolean): T {
    let x: T | undefined = undefined

    let iteration = 0
    const start = Date.now()
    while (x == undefined) {
        const randomX = getRandom(xs)
        const isXValid = isValid(randomX)
        
        if (iteration > maxIterations) {
            const now = Date.now()
            const timeDiff = ((now - start) / 1000).toFixed(3)
            console.log(`Max iterations reached when finding question. ${timeDiff} s`)
            x = randomX
        }
        else if (isXValid) {
            x = randomX
        }

        iteration++
    }

    return x
}

export function createCsvFromObjects<T extends object>(os: T[]): string {
    if (os.length == 0) {
        throw new Error(`Cannon create CSV from empty list. Given list must not be empty.`)
    }

    const firstResult = os[0]
    const keys = Object.keys(firstResult)

    const headers = keys.join(',')
    const rows = os.map(result => Object.values(result).join(','))

    const csv = `${headers}
${rows.join('\n')}
`

    return csv
}