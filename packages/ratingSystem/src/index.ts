function createBaseExpectedPlayerProbabilityFn(exponentBase: number, exponentDenominator: number) {
    return (ratingDifference: number): number => {
        const exponent = ratingDifference / exponentDenominator

        return 1 / (1 + Math.pow(exponentBase, exponent))
    }
}

type ExpectedProbabilitiesFn = (playerARating: number, playerBRating: number) => [playerAProbability: number, playerBProbability: number, ratingADifference: number, ratingBDifference: number]

function createPlayerProbabilitiesFn(exponentBase: number, exponentDenominator: number): ExpectedProbabilitiesFn {
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

type NextRatingFn = (rating: number, actualPoints: number, expectedPoints: number) => [nextRating: number, ratingChange: number]
type KFactorFunction = (rating: number) => number

function createNextRatingFn(kFactor: number | KFactorFunction): NextRatingFn {
    const kFactorFn: KFactorFunction = typeof kFactor === 'number'
        ? () => kFactor
        : kFactor

    return (rating: number, actualPoints: number, expectedPoints: number): [number, number] => {
        const change = Math.round(kFactorFn(rating) * (actualPoints - expectedPoints))
        const nextRating = rating + change

        return [nextRating, change]
    }
}

type NextRatingsFn = (playerARating: number, playerBRating: number, playerAScore: number) => {
        playerAProbability: number, 
        playerBProbability: number,
        nextPlayerARating: number,
        playerARatingDiff: number,
        nextPlayerBRating: number,
        playerBRatingDiff: number,
}

function createNextRatingsFn(
    getExpectedPlayerProbabilities: ExpectedProbabilitiesFn,
    getNextARating: NextRatingFn,
    getNextBRating: NextRatingFn
): NextRatingsFn {
    const nextRatingsFn = (playerARating: number, playerBRating: number, playerAScore: number) => {
        const [expectedPlayerAProbability, expectedPlayerBProbability] = getExpectedPlayerProbabilities(playerARating, playerBRating)
        const aProbability = playerAScore
        const bProbability = 1 - playerAScore
        
        const [nextPlayerARating, playerARatingDiff] = getNextARating(playerARating, aProbability, expectedPlayerAProbability)
        const [nextPlayerBRating, playerBRatingDiff] = getNextBRating(playerBRating, bProbability, expectedPlayerBProbability)

        return {
            playerAProbability: expectedPlayerAProbability,
            playerBProbability: expectedPlayerBProbability,
            nextPlayerARating,
            playerARatingDiff,
            nextPlayerBRating,
            playerBRatingDiff,
        }
    }

    return nextRatingsFn
}

export type RatingSystem = {
    getPlayerProbabilities: ExpectedProbabilitiesFn
    getNextRating: NextRatingFn,
    getNextRatings: NextRatingsFn
}

/**
 * Create Rating System
 * 
 * @param kFactor K-Factor (Defaults to 32) Adjust the sensitivity of rating adjustments
 * @param exponentDenominator Exponent (Rating Difference) Denominator (Higher requires greater difference in skills, smaller means even slight skill difference is significant)
 * @param exponentBase Exponent Base (Usually 10)
 */
export type KFactorFunctionWithPlayers = (rating: number, playerIndex: number | undefined) => number

export type KFactorOption = 
    | KFactorFunctionWithPlayers
    | KFactorFunction
    | number

export function createRatingSystem(kFactor: KFactorOption = 32, exponentDenominator: number = 400, exponentBase: number = 10): RatingSystem {
    
    let resolvedKFactor: KFactorFunctionWithPlayers

    if (typeof kFactor === 'number') {
        resolvedKFactor = () => kFactor
    }
    else {
        resolvedKFactor = kFactor
    }

    // Standard Elo implementation with symmetric kfactor functions for each player
    // This would be a true zero-sum game where A(-x) = B(+x)
    const symmetricKFactorFn = (rating: number) => resolvedKFactor(rating, undefined)
    const getPlayerProbabilities = createPlayerProbabilitiesFn(exponentBase, exponentDenominator)
    const getNextRating = createNextRatingFn(symmetricKFactorFn)

    // Modified Elo implementation with *asymmetric* kfactor functions (e.g. One play kfactor is higher than the others)
    // This means one player may gain or lose more than the other player would in similar
    const aKFactor = (rating: number) => resolvedKFactor(rating, 0)
    const getNextARating = createNextRatingFn(aKFactor)
    const bKFactor = (rating: number) => resolvedKFactor(rating, 1)
    const getNextBRating = createNextRatingFn(bKFactor)
    const getNextRatings = createNextRatingsFn(getPlayerProbabilities, getNextARating, getNextBRating)

    return {
        getPlayerProbabilities,
        getNextRating,
        getNextRatings
    }
}

export default createRatingSystem