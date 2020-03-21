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