function createBaseExpectedPlayerProbabilityFn(exponentBase: number, exponentDenominator: number) {
    return (ratingDifference: number): number => {
        const exponent = ratingDifference / exponentDenominator

        return 1 / (1 + Math.pow(exponentBase, exponent))
    }
}

function createExpectedPlayerProbabilitiesFn(exponentBase: number, exponentDenominator: number) {
    const expectedPlayerProbabilityFn = createBaseExpectedPlayerProbabilityFn(exponentBase, exponentDenominator)

    const expectedPlayerProbability = (playerARating: number, playerBRating: number): [number, number, number, number] => {
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

export function createRatingSystem(exponentBase: number, exponentDenominator: number, kFactor: number) {
    const expectedPlayerProbabilitiesFn = createExpectedPlayerProbabilitiesFn(exponentBase, exponentDenominator)
    const nextRatingFn = createNextRatingFn(kFactor)

    return {
        getExpectedPlayerProbabilities: expectedPlayerProbabilitiesFn,
        getNextRating: nextRatingFn
    }
}



export default createRatingSystem