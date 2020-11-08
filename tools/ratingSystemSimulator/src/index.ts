import createRatingSystem, { KFactorFunctionWithPlayers } from '@sc2/rating'
import { createCsvFromObjects, createPlayers, displayResults, processResults } from './utilities'
import fs from 'fs/promises'
import simulateGames from './simulate'

const symmetricRatingSystem = createRatingSystem()

const playerKFactor = 32
const questionKFactor = 4
const asymmetricKFactorFn: KFactorFunctionWithPlayers = (rating, playerIndex) => {
    let kFactor = playerIndex === 0
        ? playerKFactor
        : questionKFactor

    if (rating > 4000) {
        kFactor = Math.ceil(kFactor / 1.5)
    }
    else if (rating > 6000) {
        kFactor = Math.ceil(kFactor / 2)
    }

    return kFactor
}

const asymmetricRatingSystem = createRatingSystem(asymmetricKFactorFn)

// Initialize

// Create players
const initialRating = 1000
const numPlayers = 10
const playerTiers = 5
const playerRatingRange = 6000 - initialRating
const playerSegmentSize = Math.floor(numPlayers / playerTiers)
const playerIncrementAmount = Math.floor(playerRatingRange / playerTiers)

const playerGeneration = {
    total: numPlayers,
    tiers: playerTiers,
    ratingRange: playerRatingRange,
    segmentSize: playerSegmentSize,
    incrementAmount: playerIncrementAmount
}

const createPlayersFn = (prefix: string) => createPlayers(
    prefix,
    playerGeneration.total,
    initialRating,
    playerGeneration.segmentSize,
    playerGeneration.incrementAmount
)

const players = createPlayersFn('player')
// Create second set of player for asymmetric simulation
const players2 = createPlayersFn('player2')

console.log('Players Generation:')
console.table(playerGeneration)

console.log(`Initial Player Ratings`)
console.log(players.map(p => p.rating))

// Create questions
const numQuestions = 10 * 1000
const questionTiers = 200
const questionRatingRange = 6000 - initialRating
const questionSegmentSize = Math.floor(numQuestions / questionTiers)
const questionIncrementAmount = Math.floor(questionRatingRange / questionTiers)

const questionGeneration = {
    total: numQuestions,
    tiers: questionTiers,
    ratingRange: questionRatingRange,
    segmentSize: questionSegmentSize,
    incrementAmount: questionIncrementAmount
}

console.log('Question Generation:')
console.table(questionGeneration)

const createQuestionsFn = () => createPlayers(
    'question',
    questionGeneration.total,
    initialRating,
    questionGeneration.segmentSize,
    questionGeneration.incrementAmount
)

const questions = createQuestionsFn()
// Create second set of questions for asymmetric simulation
const questions2 = createQuestionsFn()

// Execute simulation
const numQuestionSequence = 1
const numQuestionsPerPlayer = 100
// The maximum difference that a question's rating will be from the player's rating
// Simulates a queuing system the pairs likely candidates
const ratingRange = 250

const execute = {
    players: players.length,
    questions: questions.length,
    numQuestionsPerPlayer,
    ratingRange,
}

const totalLoops = players.length * numQuestionsPerPlayer * numQuestionSequence
console.log(`Simulate game... (Total computations: ${totalLoops})`)
console.table(execute)

const symmetricResults = simulateGames(symmetricRatingSystem, players, questions, numQuestionSequence, numQuestionsPerPlayer, ratingRange)
const asymmetricResults = simulateGames(asymmetricRatingSystem, players2, questions2, numQuestionSequence, numQuestionsPerPlayer, ratingRange)

console.log(`${symmetricResults.length} results computed!`)

const numResultsToDisplay = 10
const processedSymmetricResults = processResults(players, questions, symmetricResults, numResultsToDisplay)
const processedAsymmetricResults = processResults(players2, questions2, asymmetricResults, numResultsToDisplay)

console.group('Symmetric Results')
displayResults(processedSymmetricResults)
console.groupEnd()

console.group('Asymmetric Results')
displayResults(processedAsymmetricResults)
console.groupEnd()

// Create CSV from Processed Results
// =========================================
const playerCsvs = [...processedSymmetricResults.resultsGroupedByPlayer]
    .map(([player, playerRatings]) => {
        const fileName = `${player.id}-results.csv`
        const csv = createCsvFromObjects(playerRatings)

        return [fileName, csv]
    })

const player2Csvs = [...processedAsymmetricResults.resultsGroupedByPlayer]
    .map(([player, playerRatings]) => {
        const fileName = `${player.id}-results.csv`
        const csv = createCsvFromObjects(playerRatings)

        return [fileName, csv]
    })

const playerWithLowestRating = processedSymmetricResults.playersByRating[0]
const singlePlayerRatings = symmetricResults.filter(r => r.playerId == playerWithLowestRating.id)
const csvString = createCsvFromObjects(singlePlayerRatings)

async function fn() {
    await fs.writeFile(`lowest-${playerWithLowestRating.id}-results.csv`, csvString, 'utf8')

    for (const [fileName, csvString] of [...playerCsvs, ...player2Csvs]) {
        await fs.writeFile(fileName, csvString, 'utf8')
    }
}

fn()


// TODO:
// - Why is sorted player results different then sorted players
// - Get top and bottom question ratings
// - Look at asymmetric rating updates (questions lower K than players)

