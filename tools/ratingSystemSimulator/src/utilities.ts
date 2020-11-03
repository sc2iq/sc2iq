import { Player, Question, Result } from './models'

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

export function getRandomPlayer(players: Player[]): Player {
    const randomPlayerIndex = randomInRange(0, players.length - 1)
    const player = players[randomPlayerIndex]

    return player
}

const maxIterations = 1000 * 1000
export function getRandomQuestionInRange(questions: Question[], minRating: number, maxRating: number): Question {
    let question: Question | undefined = undefined

    let iteration = 0
    const start = Date.now()
    while (question == undefined) {
        const randomQuestionIndex = randomInRange(0, questions.length - 1)
        const randomQuestion = questions[randomQuestionIndex]

        const isRatingWithinRange = minRating <= randomQuestion.rating  && randomQuestion.rating <= maxRating
        iteration++

        if (iteration > maxIterations) {
            const now = Date.now()
            const timeDiff = ((now - start) / 1000).toFixed(3)
            console.log(`Max iterations reached when finding question. ${timeDiff} s`)
            question = randomQuestion
        }
        if (isRatingWithinRange) {
            question = randomQuestion
        }
    }

    return question
}

export function createCsvFromPlayerResult(results: Result[]): string {
    if (results.length == 0) {
        throw new Error(`Cannon create CSV of results. Given list is empty`)
    }

    const firstResult = results[0]
    const areAllResultsOfSamePlayer = results.every(result => result.playerId === firstResult.playerId)

    const keys = Object.keys(firstResult)

    const headers = keys.join(',')
    const rows = results.map(result => Object.values(result).join(','))

    const csv = `${headers}
${rows.join('\n')}
`

    return csv
}