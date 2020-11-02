function createBaseExpectedPlayerProbabilityFn(exponentBase: number, exponentDenominator: number) {
    return (ratingDifference: number): number => {
        const exponent = ratingDifference / exponentDenominator

        return 1 / (1 + Math.pow(exponentBase, exponent))
    }
}

type ExpectedProbabilitiesFn = (playerARating: number, playerBRating: number) => [number, number, number, number]

function createExpectedPlayerProbabilitiesFn(exponentBase: number, exponentDenominator: number): ExpectedProbabilitiesFn {
    const expectedPlayerProbabilityFn = createBaseExpectedPlayerProbabilityFn(exponentBase, exponentDenominator)

    const expectedPlayerProbability: ExpectedProbabilitiesFn = (playerARating, playerBRating) => {
        const ratingADifference = playerBRating - playerARating
        const ratingBDifference = playerARating - playerBRating

        const playerAProbability = expectedPlayerProbabilityFn(ratingADifference)
        const playerBProbability = expectedPlayerProbabilityFn(ratingBDifference)

        return [
            playerAProbability,
            playerBProbability,
            ratingADifference,
            ratingBDifference,
        ]
    }

    return expectedPlayerProbability
}

type KFactorFunction = (rating: number) => number

function createNextRatingFn(kFactor: number | KFactorFunction) {
    const kFactorFn: KFactorFunction = typeof kFactor === 'number'
        ? () => kFactor
        : kFactor

    return (rating: number, actualPoints: number, expectedPoints: number): [number, number] => {
        const change = Math.round(kFactorFn(rating) * (actualPoints - expectedPoints))
        const nextRating = rating + change

        return [nextRating, change]
    }
}

type NextRatingFn = (rating: number, actualPoints: number, expectedPoints: number) => [number, number]

function createNextRatingsFn(getExpectedPlayerProbabilities: ExpectedProbabilitiesFn, getNextRating: NextRatingFn) {
    const nextRatingsFn = (playerARating: number, playerBRating: number, playerAScore: number) => {
        const [expectedPlayerAProbability, expectedPlayerBProbability] = getExpectedPlayerProbabilities(playerARating, playerBRating)
        const aProbability = playerAScore
        const bProbability = 1 - playerAScore
        
        const [nextPlayerARating, playerADiff] = getNextRating(playerARating, aProbability, expectedPlayerAProbability)
        const [nextPlayerBRating, playerBDiff] = getNextRating(playerBRating, bProbability, expectedPlayerBProbability)

        return {
            expectedPlayerAProbability,
            expectedPlayerBProbability,
            nextPlayerARating,
            playerADiff,
            nextPlayerBRating,
            playerBDiff,
        }
    }

    return nextRatingsFn
}

/**
 * Create Rating System
 * 
 * @param kFactor K-Factor (Defaults to 32) Adjust the sensitivity of rating adjustments
 * @param exponentDenominator Exponent (Rating Difference) Denominator (Higher requires greater difference in skills, smaller means even slight skill difference is significant)
 * @param exponentBase Exponent Base (Usually 10)
 */
export function createRatingSystem(kFactor: number = 32, exponentDenominator: number = 400, exponentBase: number = 10) {
    const getExpectedPlayerProbabilities = createExpectedPlayerProbabilitiesFn(exponentBase, exponentDenominator)
    const getNextRating = createNextRatingFn(kFactor)
    const getNextRatings = createNextRatingsFn(getExpectedPlayerProbabilities, getNextRating)

    return {
        getExpectedPlayerProbabilities,
        getNextRating,
        getNextRatings
    }
}

export default createRatingSystem