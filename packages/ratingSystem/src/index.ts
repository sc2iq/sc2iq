function expectedPlayerOutcome(exponentBase: number, exponentDenominator: number) {
    return (ratingDifference: number): number => {
        const exponent = ratingDifference / exponentDenominator

        return 1 / (1 + Math.pow(exponentBase, exponent))
    }
}

function expectedPlayerRatings(exponentBase: number, exponentDenominator: number) {
    const expectedPlayerRatingNormal = expectedPlayerOutcome(exponentBase, exponentDenominator)

    const expectedPlayerAOutcome = (playerARating: number, playerBRating: number): number => {
        const ratingDifference = playerBRating - playerARating

        return expectedPlayerRatingNormal(ratingDifference)
    }

    const expectedPlayerBOutcome = (playerARating: number, playerBRating: number): number => {
        const ratingDifference = playerARating - playerBRating

        return expectedPlayerRatingNormal(ratingDifference)
    }

    return {
        expectedPlayerAOutcome,
        expectedPlayerBOutcome,
    }
}

function nextRating(kFactor: number) {
    return (rating: number, actualPoints: number, expectedPoints: number): number => {
        return rating + kFactor * (actualPoints - expectedPoints)
    }
}

export function createRatingSystem(exponentBase: number, exponentDenominator: number, kFactor: number) {
    const { expectedPlayerAOutcome, expectedPlayerBOutcome } = expectedPlayerRatings(exponentBase, exponentDenominator)
    const nextRatingFn = nextRating(kFactor)

    return {
        expectedPlayerAOutcome,
        expectedPlayerBOutcome,
        nextRating: nextRatingFn
    }
}

export default createRatingSystem