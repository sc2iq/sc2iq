export type Player = {
    id: string,
    rating: number,
}

export type Question = {
    id: string,
    rating: number,
}

export type Result = {
    iteration: number,
    playerId: string,
    playerRating: string,
    playerProbability: string
    updatedPlayerRating: string,
    questionId: string,
    questionRating: string,
    questionProbability: string,
    updatedQuestionRating: string,
    outcome: number,
}