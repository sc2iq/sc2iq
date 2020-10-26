import createRatingSystem from './index'

const exponentDenominator = 400
const exponentBase = 10
const kFactor = 32

const rating = createRatingSystem(exponentBase, exponentDenominator, kFactor)

const data = [
    [1000, 1200, 1],
    [1000, 1400, 1],
    [1000, 2000, 1],
    [1000, 1200, 0],
    [1000, 1400, 0],
    [1000, 2000, 0],
]

const results = []

for (const [playerARating, playerBRating, actualProbability] of data) {

    const [expectedPlayerAProbability, expectedPlayerBProbability] = rating.getExpectedPlayerProbabilities(playerARating, playerBRating)
    const aProbability = actualProbability
    const bProbability = 1 - actualProbability

    const [nextPlayerARating, playerADiff] = rating.getNextRating(playerARating, aProbability, expectedPlayerAProbability)
    const [nextPlayerBRating, playerBDiff] = rating.getNextRating(playerBRating, bProbability, expectedPlayerBProbability)
    const winText = actualProbability === 1
        ? 'A wins'
        : 'B wins'
    const textProbability = `A ${playerARating} vs B ${playerBRating}: ${winText} ${playerADiff.toFixed(0)} | ${playerBDiff.toFixed(0)}`.padEnd(40)

    const record = {
        playerARating,
        playerBRating,
        expectedPlayerAProbability: expectedPlayerAProbability.toFixed(3),
        expectedPlayerBProbability: expectedPlayerBProbability.toFixed(3),
        nextPlayerARating: Math.round(nextPlayerARating),
        playerADiff: Math.round(playerADiff),
        nextPlayerBRating: Math.round(nextPlayerBRating),
        playerBDiff: Math.round(playerBDiff),
        textProbability,
    }

    results.push(record)
}

console.table(results)