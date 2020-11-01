import createRatingSystem from '@sc2/rating'
import { Player, Question, Result } from './models'
import { randomInRange, trunc } from './utilities'

const exponentDenominator = 400
const exponentBase = 10
const kFactor = 32

const ratingSystem = createRatingSystem(exponentBase, exponentDenominator, kFactor)

// Initialize

// - Create players
const numPlayers = 1000
const initialRating = 1000
const players = Array.from({ length: numPlayers }, (_, i) => i)
    .map<Player>(v => {
        return {
            id: `player${v}`,
            rating: initialRating
        }
    })

// - Create questions
const numQuestions = 100
const questions = Array.from({ length: numQuestions }, (_, i) => i)
    .map<Question>(v => {
        return {
            id: `question${v}`,
            rating: initialRating
        }
    })

// Execute
const numQuestionSequence = 10
const numIterations = 10 * 1000

const results: Result[] = []

for (let i = 0; i < numIterations; i++) {
    const randomPlayerIndex = randomInRange(0, players.length - 1)

    const player = players[randomPlayerIndex]
    const randomQuestions = Array.from({ length: numQuestionSequence }, (_, i) => {
        const randomQuestionIndex = randomInRange(0, questions.length - 1)
        const question = questions[randomQuestionIndex]
        return question
    })

    for (const question of randomQuestions) {
        const [playerProbability, questionProbability] = ratingSystem.getExpectedPlayerProbabilities(player.rating, question.rating)

        // Bias random based on probability so better player / more knowledgeable user is more likely to score / answer correct
        const playerOutcome = Math.random() < playerProbability
            ? 1
            : 0
        const questionOutcome = 1 - playerOutcome
        const [updatedPlayerRating, playerDiff] = ratingSystem.getNextRating(player.rating, playerOutcome, playerProbability)
        const [updatedQuestionRating, questionDiff] = ratingSystem.getNextRating(question.rating, questionOutcome, questionProbability)

        const result: Result = {
            iteration: i,
            playerId: player.id,
            playerRating: player.rating.toString().padStart(4, ' '),
            questionId: question.id,
            questionRating: question.rating.toString().padStart(4, ' '),
            playerProbability: playerProbability.toFixed(3).padEnd(4, '0'),
            questionProbability: questionProbability.toFixed(3).padEnd(4, '0'),
            outcome: playerOutcome,
            updatedPlayerRating: `${Math.round(updatedPlayerRating)} (${playerDiff.toString().padStart(3, '+')})`,
            updatedQuestionRating: `${Math.round(updatedQuestionRating)} (${questionDiff.toString().padStart(3, '+')})`
        }

        player.rating = Math.round(updatedPlayerRating)
        question.rating = Math.round(updatedQuestionRating)

        results.push(result)
    }
}

console.log(`${results.length} results computed!`)

const numResultsToDisplay = 10
const topNresults = results.filter((_, i) => i < numResultsToDisplay)
console.table(topNresults)

const playerRatingsOverTime = players.map(player => {
    const playerResults = results.filter(result => result.playerId === player.id)
    const ratings = playerResults
        .map(r => r.playerRating)

    return ratings
})

const numPlayerResultsToDisplay = 10
const topNPlayerResults = playerRatingsOverTime.filter((_, i) => i < numPlayerResultsToDisplay)
console.log(topNPlayerResults)


