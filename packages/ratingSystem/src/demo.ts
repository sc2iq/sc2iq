import createRatingSystem from './index'

const exponentDenominator = 400
const exponentBase = 10
const kFactor = 32

const rating = createRatingSystem(exponentBase, exponentDenominator, kFactor)

// [playerARating, playerBRating, actualOutcome]
const data = [
    [1000, 1200, 1],
    [1000, 1400, 1],
    [1000, 2000, 1],
    [1000, 1200, 0],
    [1000, 1400, 0],
    [1000, 2000, 0],
]

const results = []

for (const [playerARating, playerBRating, actualOutcome] of data) {

    const expectedPlayerAOutcome = rating.expectedPlayerAOutcome(playerARating, playerBRating)
    const expectedPlayerBOutcome = rating.expectedPlayerBOutcome(playerARating, playerBRating)
    const aOutcome = actualOutcome
    const bOutcome = Math.abs(1 - actualOutcome)

    const nextPlayerARating = rating.nextRating(playerARating, aOutcome, expectedPlayerAOutcome)
    const playerADiff = nextPlayerARating - playerARating
    const nextPlayerBRating = rating.nextRating(playerBRating, bOutcome, expectedPlayerBOutcome)
    const playerBDiff = nextPlayerBRating - playerBRating

    const win = actualOutcome === 1
        ? 'A wins'
        : 'B wins'
    const textOutcome = `A ${playerARating} vs B ${playerBRating}: ${win} ${playerADiff.toFixed(0)} | ${playerBDiff.toFixed(0)}`.padEnd(40)

    const record = {
        playerARating,
        playerBRating,
        expectedPlayerAOutcome: expectedPlayerAOutcome.toFixed(3),
        expectedPlayerBOutcome: expectedPlayerBOutcome.toFixed(3),
        nextPlayerARating: Math.round(nextPlayerARating),
        playerADiff: Math.round(playerADiff),
        nextPlayerBRating: Math.round(nextPlayerBRating),
        playerBDiff: Math.round(playerBDiff),
        textOutcome,
    }

    results.push(record)
}

console.table(results)