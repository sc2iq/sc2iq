import createRatingSystem from '@sc2/rating'
import { convertResultToDisplayResult, Player, Question, Result } from './models'
import { getRandomPlayer, getRandomQuestionInRange, randomInRange, trunc } from './utilities'

const exponentDenominator = 400
const exponentBase = 10
const kFactor = 32

const ratingSystem = createRatingSystem(exponentBase, exponentDenominator, kFactor)

// Initialize

// Create players
const initialRating = 1000
const numPlayers = 10
const playerTiers = 4
const playerRatingRange = 6000 - initialRating
const playerSegmentSize = Math.floor(numPlayers / playerTiers)
const playerIncrementAmount = Math.floor(playerRatingRange / playerTiers)

const playerGeneration = {
    total: numPlayers,
    tiers: playerTiers,
    playerRatingRange,
    playerSegmentSize,
    incrementAmount: playerIncrementAmount
}

const players = Array.from({ length: numPlayers }, (_, i) => i)
    .map<Player>(v => {
        const rating = initialRating + Math.floor(v / playerSegmentSize) * playerIncrementAmount
        return {
            id: `player${v}`,
            rating
        }
    })

console.log('Players Generation:')
console.table(playerGeneration)

// Create questions
const numQuestions = 1 * 1000
const questionTiers = 200
const questionRatingRange = 6000 - initialRating
const questionSegmentSize = Math.floor(numQuestions / questionTiers)
const questionIncrementAmount = Math.floor(questionRatingRange / questionTiers)

const questionGeneration = {
    total: numQuestions,
    tiers: questionTiers,
    questionRatingRange,
    questionSegmentSize,
    incrementAmount: questionIncrementAmount
}

console.log('Question Generation:')
console.table(questionGeneration)

const questions = Array.from({ length: numQuestions }, (_, i) => i)
    .map<Question>(v => {
        const rating = initialRating + Math.floor(v / questionSegmentSize) * questionIncrementAmount
        return {
            id: `question${v}`,
            rating
        }
    })

// Execute simulation
const numQuestionSequence = 1
const numQuestionsPerPlayer = 100
// The maximum difference that a question's rating will be from the player's rating
// Simulates a queuing system the pairs likely candidates
const ratingRange = 250

const results: Result[] = []
const execute = {
    players: players.length,
    questions: questions.length,
    numQuestionsPerPlayer,
    ratingRange,
}

const totalLoops = players.length * numQuestionsPerPlayer * numQuestionSequence
console.log(`Simulate game... (Total computations: ${totalLoops})`)
console.table(execute)

for (const player of players) {
    for (let i = 0; i < numQuestionsPerPlayer; i++) {
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
                questionId: question.id,
                playerRating: player.rating,
                questionRating: question.rating,
                playerProbability: playerProbability,
                questionProbability: questionProbability,
                playerOutcome,
                expectedOutcome,
                updatedPlayerRating,
                updatedPlayerDiff: playerDiff,
                updatedQuestionRating,
                updatedQuestionDiff: questionDiff
            }

            player.rating = Math.round(updatedPlayerRating)
            question.rating = Math.round(updatedQuestionRating)

            console.log(`add result: ${player.id} i:${i}`)
            results.push(result)
        }
    }
}


console.log(`${results.length} results computed!`)

const numResultsToDisplay = 10
const topNresults = results
    .filter((_, i) => i < numResultsToDisplay)
    .map(result => convertResultToDisplayResult(result))

console.table(topNresults)

const playersByRating = [...players].sort((a, b) => a.rating - b.rating)
const questionsByRating = [...questions].sort((a, b) => a.rating - b.rating)
const playerRatingsOverTime = players.map(player => {
    const playerResults = results.filter(result => result.playerId === player.id)
    const ratings = playerResults
        .map(r => r.playerRating)

    return ratings
})

const sortedPlayerRatings = playerRatingsOverTime.sort((a, b) => {
    const aLastRating = a[a.length - 1]
    const bLastRating = b[b.length - 1]

    return aLastRating - bLastRating
})

const lastNResults = 1

const topNPlayersWithLowestRating = playersByRating
    .slice(0, numResultsToDisplay)
    .map(player => player.rating)

const topNQuestionsWithLowestRating = questionsByRating
    .slice(0, numResultsToDisplay)
    .map(player => player.rating)

const topNPlayersWithHighestRatings = playersByRating
    .slice(-numResultsToDisplay)
    .map(player => player.rating)

const topNQuestionsWithHighestRatings = questionsByRating
    .slice(-numResultsToDisplay)
    .map(player => player.rating)

const topNPlayerResultsWithLowestRatings = sortedPlayerRatings
    .slice(0, numResultsToDisplay)
    .map(results => results.slice(-lastNResults))

const topNPlayerResultsWithHighestRatings = sortedPlayerRatings
    .slice(-numResultsToDisplay)
    .map(results => results.slice(0, lastNResults))

console.log(`Players with lowest ratings`)
console.log(topNPlayersWithLowestRating)
console.log(`Player results with the lowest rating`)
console.log(topNPlayerResultsWithLowestRatings)

console.log(`Players with highest ratings`)
console.log(topNPlayersWithHighestRatings)
console.log(`Player results with the lowest rating`)
console.log(topNPlayerResultsWithHighestRatings)

console.log(`Questions with lowest ratings`)
console.log(topNQuestionsWithLowestRating)
console.log(`Questions with highest ratings`)
console.log(topNQuestionsWithHighestRatings)

// TODO:
// - Why is sorted player results different then sorted players
// - Get top and bottom question ratings
// - Look at asymmetric rating updates (questions lower K than players)

