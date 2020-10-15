function createExpectedPlayerProbabilityFn(exponentBase: number, exponentDenominator: number) {
    return (ratingDifference: number): number => {
        const exponent = ratingDifference / exponentDenominator

        return 1 / (1 + Math.pow(exponentBase, exponent))
    }
}

function expectedPlayerProbabilities(exponentBase: number, exponentDenominator: number) {
    const expectedPlayerProbabilityFn = createExpectedPlayerProbabilityFn(exponentBase, exponentDenominator)

    const expectedPlayerAProbability = (playerARating: number, playerBRating: number): number => {
        const ratingDifference = playerBRating - playerARating

        return expectedPlayerProbabilityFn(ratingDifference)
    }

    const expectedPlayerBProbability = (playerARating: number, playerBRating: number): number => {
        const ratingDifference = playerARating - playerBRating

        return expectedPlayerProbabilityFn(ratingDifference)
    }

    return {
        expectedPlayerAProbability,
        expectedPlayerBProbability,
    }
}

function createNextRatingFn(kFactor: number) {
    return (rating: number, actualPoints: number, expectedPoints: number): number => {
        return rating + kFactor * (actualPoints - expectedPoints)
    }
}

export function createRatingSystem(exponentBase: number, exponentDenominator: number, kFactor: number) {
    const { expectedPlayerAProbability, expectedPlayerBProbability } = expectedPlayerProbabilities(exponentBase, exponentDenominator)
    const nextRating = createNextRatingFn(kFactor)

    return {
        expectedPlayerAProbability,
        expectedPlayerBProbability,
        nextRating
    }
}

export default createRatingSystem