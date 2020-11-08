import { RatingSystem } from "@sc2/rating"
import { Player, Question, Result } from "./models"
import { getRandomWhichMeetsConstraints } from "./utilities"

// For each player simulate the player answering series of questions and observe rating changes
export default function simulateGames(
    ratingSystem: RatingSystem,
    ps: Player[],
    qs: Question[],
    numQuestionSequence: number,
    numQuestionsPerPlayer: number,
    ratingRange: number
): Result[] {
    const results: Result[] = []

    for (const player of ps) {
        for (let i = 0; i < numQuestionsPerPlayer; i++) {
            const minRating = player.rating - ratingRange
            const maxRating = player.rating + ratingRange
            const isRatingWithinRange = (question: Question) => minRating <= question.rating  && question.rating <= maxRating
    
            const randomQuestions = Array.from({ length: numQuestionSequence }, (_, i) =>
                getRandomWhichMeetsConstraints(qs, isRatingWithinRange))
    
            for (const question of randomQuestions) {
                // Need to expose the probabilities in order to compute the outcome
                // For the simulation we want the score biased based on the skill difference
                // Intention is the better / more knowledgeable user is more likely to score / answer correct
                const [playerProbability, questionProbability] = ratingSystem.getPlayerProbabilities(player.rating, question.rating)
                const expectedOutcome = playerProbability > 0.5 ? 1 : 0
                const playerOutcome = Math.random() < playerProbability ? 1 : 0
                // const questionOutcome = 1 - playerOutcome
    
                const symmetricUpdate = ratingSystem.getNextRatings(player.rating, question.rating, playerOutcome)
    
                const result: Result = {
                    iteration: i,
                    playerId: player.id,
                    questionId: question.id,
                    playerRating: player.rating,
                    questionRating: question.rating,
                    playerProbability: playerProbability,
                    questionProbability: questionProbability,
                    playerOutcome,
                    expectedOutcome,
                    updatedPlayerRating: symmetricUpdate.nextPlayerARating,
                    updatedPlayerDiff: symmetricUpdate.playerARatingDiff,
                    updatedQuestionRating: symmetricUpdate.nextPlayerBRating,
                    updatedQuestionDiff: symmetricUpdate.playerBRatingDiff
                }
    
                player.rating = Math.round(symmetricUpdate.nextPlayerARating)
                question.rating = Math.round(symmetricUpdate.nextPlayerBRating)
    
                // console.log(`add result: ${player.id} i:${i}`)
                results.push(result)
            }
        }
    }

    return results
}
