import * as models from "../models"

export function getRandomNumber(max: number, min: number = 0) {
    const n = Math.floor(Math.random() * max) + min

    return n
}

export function delay(ms: number) {
    return new Promise((res) => setTimeout(() => res(), ms))
}

export function computeDurationsOfScore(rawScore: models.Score): models.ScoreComputed {
    const lastAnswer = rawScore.answers[rawScore.answers.length - 1]
    const totalDuration = new Date(lastAnswer.submittedAt).getTime() - new Date(rawScore.startedAt).getTime()

    const computedAnswers = rawScore.answers.map((a, i) => {
        const prevTime = i === 0
            ? rawScore.startedAt
            : rawScore.answers[i - 1].submittedAt

        const duration = new Date(a.submittedAt).getTime() - new Date(prevTime).getTime()
        return {
            ...a,
            duration,
        }
    })

    const points = rawScore.answers.reduce((p, a) => p + a.points, 0)
    const totalDifficulty = rawScore.answers.reduce((d, a) => d + a.question.difficulty, 0)
    const avgDifficulty = totalDifficulty / rawScore.answers.length

    const computedScore: models.ScoreComputed = {
        ...rawScore,
        avgDifficulty,
        answers: computedAnswers,
        duration: totalDuration,
        points,
    }

    return computedScore
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
type ShuffledT<T> = { i: number, original: T }
export function randomizeList<T extends string | object>(originalArray: T[]): ShuffledT<T>[] {
    const array = [...originalArray] as (T | ShuffledT<T>)[]
    let currentIndex = array.length
    let temporaryValue
    let randomIndex

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex -= 1

        // Save the last element that's un-shuffled
        temporaryValue = array[currentIndex]
        // Move random element to end (shuffled set)
        array[currentIndex] = {
            i: randomIndex,
            original: array[randomIndex],
        } as ShuffledT<T>

        // Put the last un-shuffled element to the random position
        array[randomIndex] = temporaryValue
    }

    // All are shuffled
    return array as ShuffledT<T>[]
}