import createRatingSystem from './index'

const exponentDenominator = 400
const exponentBase = 10
const kFactor = 32

const rating = createRatingSystem(exponentBase, exponentDenominator, kFactor)

const data: [number, number, number][] = [
    [1000, 1200, 1],
    [1000, 1400, 1],
    [1000, 2000, 1],
    [1000, 1200, 0],
    [1000, 1400, 0],
    [1000, 2000, 0],
]

const results = []

for (const [playerARating, playerBRating, actualScore] of data) {

    // Manual Computation
    // const [expectedPlayerAProbability, expectedPlayerBProbability] = rating.getExpectedPlayerProbabilities(playerARating, playerBRating)
    // const aProbability = actualScore
    // const bProbability = 1 - actualScore

    // const [nextPlayerARating, playerADiff] = rating.getNextRating(playerARating, aProbability, expectedPlayerAProbability)
    // const [nextPlayerBRating, playerBDiff] = rating.getNextRating(playerBRating, bProbability, expectedPlayerBProbability)

    // Internal Computation
    const {
        playerAProbability,
        playerBProbability,
        nextPlayerARating,
        playerARatingDiff,
        nextPlayerBRating,
        playerBRatingDiff
    } = rating.getNextRatings(playerARating, playerBRating, actualScore)

    const winText = actualScore === 1
        ? 'A wins'
        : 'B wins'
    const textProbability = `A ${playerARating} vs B ${playerBRating}: ${winText} ${playerARatingDiff.toFixed(0)} | ${playerBRatingDiff.toFixed(0)}`.padEnd(40)

    const record = {
        playerARating,
        playerBRating,
        expectedPlayerAProbability: playerAProbability.toFixed(3),
        expectedPlayerBProbability: playerBProbability.toFixed(3),
        nextPlayerARating: Math.round(nextPlayerARating),
        playerADiff: Math.round(playerARatingDiff),
        nextPlayerBRating: Math.round(nextPlayerBRating),
        playerBDiff: Math.round(playerBRatingDiff),
        textProbability,
    }

    results.push(record)
}

console.table(results)