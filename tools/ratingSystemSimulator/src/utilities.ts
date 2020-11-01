import { Player, Question } from './models'

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

export function getRandomQuestionInRange(questions: Question[], minRating: number, maxRating: number): Question {
    let question: Question | undefined = undefined

    while (question == undefined) {
        const randomQuestionIndex = randomInRange(0, questions.length - 1)
        const randomQuestion = questions[randomQuestionIndex]

        const isRatingWithinRange = randomQuestion.rating >= minRating
            && randomQuestion.rating <= maxRating

        if (isRatingWithinRange) {
            question = randomQuestion
        }
    }

    return question
}