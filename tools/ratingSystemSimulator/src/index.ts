import createRatingSystem from '@sc2/rating'
import { Player, Question, Result } from './models'
import { getRandomPlayer, getRandomQuestionInRange, randomInRange, trunc } from './utilities'

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
const numQuestions = 1000
const tiers = 20
const questionRatingRange = 6000 - initialRating

const questionSegmentSize = Math.floor(numQuestions / tiers)
const incrementAmount = Math.floor(questionRatingRange / tiers)

const questionGeneration = {
    total: numQuestions,
    tiers,
    questionRatingRange,
    questionSegmentSize,
    incrementAmount
}

console.log('Question Generation:')
console.table(questionGeneration)

const questions = Array.from({ length: numQuestions }, (_, i) => i)
    .map<Question>(v => {
        const rating = initialRating + Math.floor(v / questionSegmentSize) * incrementAmount
        return {
            id: `question${v}`,
            rating
        }
    })

// Execute
const numQuestionSequence = 10
const numIterations = 100 * 1000
const ratingRange = 500
const results: Result[] = []

for (let i = 0; i < numIterations; i++) {
    const player = getRandomPlayer(players)
    const randomQuestions = Array.from({ length: numQuestionSequence }, (_, i) =>
        getRandomQuestionInRange(questions, player.rating - ratingRange, player.rating + ratingRange))

    for (const question of randomQuestions) {
        const [playerProbability, questionProbability] = ratingSystem.getExpectedPlayerProbabilities(player.rating, question.rating)

        // Bias random based on probability so better player / more knowledgeable user is more likely to score / answer correct
        const expectedOutcome = playerProbability > 0.5 ? 1 : 0
        const playerOutcome = Math.random() < playerProbability ? 1 : 0
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
            outcome: `${playerOutcome} (${expectedOutcome})`,
            updatedPlayerRating: `${Math.round(updatedPlayerRating)} (${playerDiff > 0 ? `+${playerDiff}` : playerDiff.toString()})`,
            updatedQuestionRating: `${Math.round(updatedQuestionRating)} (${questionDiff > 0 ? `+${questionDiff}` : questionDiff.toString()})`
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
const lastNresult = 10

const topNPlayerResults = playerRatingsOverTime
    .filter((_, i) => i < numPlayerResultsToDisplay)
    .map(results => results.slice(-lastNresult))

console.log(topNPlayerResults)


