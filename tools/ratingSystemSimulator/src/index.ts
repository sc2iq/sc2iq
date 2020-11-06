import createRatingSystem, { KFactorFunctionWithPlayers } from '@sc2/rating'
import { convertResultToDisplayResult, Player, Question, Result } from './models'
import { createCsvFromObjects, getRandom, getRandomWhichMeetsConstraints, randomInRange, trunc } from './utilities'
import fs from 'fs/promises'

const symmetricRatingSystem = createRatingSystem()

const asymmetricKFactorFn: KFactorFunctionWithPlayers = (rating, playerIndex) => {
    let kFactor = playerIndex === 0
        ? 32
        : 5

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

// For each player simulate the player answering series of questions and observe rating changes
for (const player of players) {
    for (let i = 0; i < numQuestionsPerPlayer; i++) {
        const minRating = player.rating - ratingRange
        const maxRating = player.rating + ratingRange
        const isRatingWithinRange = (question: Question) => minRating <= question.rating  && question.rating <= maxRating

        const randomQuestions = Array.from({ length: numQuestionSequence }, (_, i) =>
            getRandomWhichMeetsConstraints(questions, isRatingWithinRange))

        for (const question of randomQuestions) {
            // Need to expose the probabilities in order to compute the outcome
            // For the simulation we want the score biased based on the skill difference
            // Intention is the better / more knowledgeable user is more likely to score / answer correct
            const [playerProbability, questionProbability] = symmetricRatingSystem.getPlayerProbabilities(player.rating, question.rating)
            const expectedOutcome = playerProbability > 0.5 ? 1 : 0
            const playerOutcome = Math.random() < playerProbability ? 1 : 0
            // const questionOutcome = 1 - playerOutcome

            const symmetricUpdate = symmetricRatingSystem.getNextRatings(player.rating, question.rating, playerOutcome)
            const asymmetricUpdate = asymmetricRatingSystem.getNextRatings(player.rating, question.rating, playerOutcome)

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


console.log(`${results.length} results computed!`)

const numResultsToDisplay = 10
const topNresults = results
    .filter((_, i) => i < numResultsToDisplay)
    .map(result => convertResultToDisplayResult(result))

console.table(topNresults)

const playersByRating = [...players].sort((a, b) => a.rating - b.rating)
const questionsByRating = [...questions].sort((a, b) => a.rating - b.rating)

const resultsGroupedByPlayer: Map<Player, Result[]> = players.reduce((resultsMap, player) => {
    const playerResults = results.filter(result => result.playerId === player.id)
    resultsMap.set(player, playerResults)
    return resultsMap
}, new Map<Player, Result[]>())

const playerRatingsOverTime = [...resultsGroupedByPlayer].map(([player, playerResults]) => playerResults.map(r => r.playerRating))
const playerRatingsSortedByFinalRating = playerRatingsOverTime.sort((a, b) => {
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

const topNPlayerResultsWithLowestRatings = playerRatingsSortedByFinalRating
    .slice(0, numResultsToDisplay)
    .map(results => results.slice(-lastNResults))

const topNPlayerResultsWithHighestRatings = playerRatingsSortedByFinalRating
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

const playerCsvs = [...resultsGroupedByPlayer].map(([player, playerRatings]) => {
    const fileName = `${player.id}-results.csv`
    const csv = createCsvFromObjects(playerRatings)

    return [fileName, csv]
})

const playerWithLowestRating = playersByRating[0]
const singlePlayerRatings = results.filter(r => r.playerId == playerWithLowestRating.id)
const csvString = createCsvFromObjects(singlePlayerRatings)

async function fn() {
    await fs.writeFile(`lowest-${playerWithLowestRating.id}-results.csv`, csvString, 'utf8')

    for(const [fileName, csvString] of playerCsvs) {
        await fs.writeFile(fileName, csvString, 'utf8')
    }
}

fn()


// TODO:
// - Why is sorted player results different then sorted players
// - Get top and bottom question ratings
// - Look at asymmetric rating updates (questions lower K than players)

