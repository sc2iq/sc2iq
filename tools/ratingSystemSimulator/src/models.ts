export type Player = {
    id: string
    rating: number
}

export type Question = Player

export type Result = {
    iteration: number
    playerId: string
    playerRating: number
    playerProbability: number
    updatedPlayerRating: number
    updatedPlayerDiff: number
    questionId: string
    questionRating: number
    questionProbability: number
    updatedQuestionRating: number
    updatedQuestionDiff: number
    playerOutcome: number
    expectedOutcome: number
}

export type ResultDisplayed = {
    iteration: number
    playerId: string
    playerRating: string
    ratingDifference: number
    playerProbability: string
    updatedPlayerRating: string
    questionId: string
    questionRating: string
    // questionProbability: string
    updatedQuestionRating: string
    outcome: string
}

export function convertResultToDisplayResult (result: Result): ResultDisplayed {
    return {
        iteration: result.iteration,
        playerId: result.playerId,
        questionId: result.questionId,
        playerRating: result.playerRating.toString().padStart(4, ' '),
        questionRating: result.questionRating.toString().padStart(4, ' '),
        ratingDifference: result.playerRating - result.questionRating,
        playerProbability: result.playerProbability.toFixed(3).padEnd(4, '0'),
        // questionProbability: questionProbability.toFixed(3).padEnd(4, '0'),
        outcome: `${result.playerOutcome} (${result.expectedOutcome})`,
        updatedPlayerRating: `${Math.round(result.updatedPlayerRating)} (${result.updatedPlayerDiff > 0 ? `+${result.updatedPlayerDiff}` : result.updatedPlayerDiff.toString()})`,
        updatedQuestionRating: `${Math.round(result.updatedQuestionRating)} (${result.updatedQuestionDiff > 0 ? `+${result.updatedQuestionDiff}` : result.updatedQuestionDiff.toString()})`
    }
}