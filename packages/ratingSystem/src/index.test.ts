import createRatingSystem, { KFactorFunctionWithPlayers } from './index'

const symmetricKFactor = 32
const ratingSystem = createRatingSystem(symmetricKFactor)

const playerAKFactor = 20
const playerBKFactor = 10

const kFactorFn: KFactorFunctionWithPlayers = (rating, playerIndex) => {
    let factor = playerIndex === 0
        ? playerAKFactor
        : playerBKFactor

    if (rating > 4000) {
        factor = Math.round(factor / 2)
    }

    return factor
}
const asymmetricRatingSystem = createRatingSystem(kFactorFn)

describe('ELO rating system', () => {
    describe('expectedPlayerARating', () => {
        it('given player A has EQUAL rating as player B, expected rating should be 0.5', () => {
            // Arrange
            const playerARating = 1000
            const playerBRating = 1000

            // Act
            const [a, b] = ratingSystem.getPlayerProbabilities(playerARating, playerBRating)

            // Assert
            expect(a).toBe(0.5)
            expect(b).toBe(0.5)
        })

        it('given player A has HIGHER rating than player B, expected rating should be > 0.5', () => {
            // Arrange
            const playerARating = 1200
            const playerBRating = 1000

            // Act
            const [a, b] = ratingSystem.getPlayerProbabilities(playerARating, playerBRating)

            // Assert
            expect(a).toBeGreaterThan(0.5)
            expect(b).toBeLessThan(0.5)
        })

        it('given player A has LOWER rating than player B, expected rating should be < 0.5', () => {
            // Arrange
            const playerARating = 1000
            const playerBRating = 1200

            // Act
            const [a, b] = ratingSystem.getPlayerProbabilities(playerARating, playerBRating)

            // Assert
            expect(a).toBeLessThan(0.5)
            expect(b).toBeGreaterThan(0.5)
        })
    })

    describe('nextRating', () => {
        it('given actual Probability EQUAL expected Probability, next rating should be EQUAL', () => {
            // Arrange
            const actualOutcome = 0.5
            const expectedOutcome = 0.5
            const playerRating = 1000

            // Act
            const [nextRating, change] = ratingSystem.getNextRating(playerRating, actualOutcome, expectedOutcome)

            // Assert
            expect(nextRating).toBe(playerRating)
            expect(change).toBe(0)
        })

        it('given actual outcome GREATER than expected outcome, next rating GREATER than original rating', () => {
            // Arrange
            const actualOutcome = 1
            const expectedOutcome = 0.75
            const playerRating = 1000

            // Act
            const [nextRating, change] = ratingSystem.getNextRating(playerRating, actualOutcome, expectedOutcome)

            // Assert
            expect(nextRating).toBeGreaterThan(playerRating)
            expect(change).toBeGreaterThan(0)
        })

        it('given actual outcome LESS than expected outcome, next rating LESS than original rating', () => {
            // Arrange
            const actualOutcome = 0
            const expectedOutcome = 0.50
            const playerRating = 1000

            // Act
            const [nextRating, change] = ratingSystem.getNextRating(playerRating, actualOutcome, expectedOutcome)

            // Assert
            expect(nextRating).toBeLessThan(playerRating)
            expect(change).toBeLessThan(0)
        })
    })

    describe('getNextRatings', () => {
        describe('symmetric system', () => {
            it('given current ratings and score compute expected probabilities and ratings', () => {
                // Arrange
                const playerARating = 1000
                const playerBRating = 1200
                const playerAScore = 1

                // Act
                const {
                    playerAProbability,
                    playerBProbability,
                    nextPlayerARating,
                    playerARatingDiff,
                    nextPlayerBRating,
                    playerBRatingDiff
                } = ratingSystem.getNextRatings(playerARating, playerBRating, playerAScore)

                // Assert
                expect(playerAProbability).toBeLessThan(0.5)
                expect(playerBProbability).toBeGreaterThan(0.5)
                expect(nextPlayerARating).toBeGreaterThan(playerARating)
                expect(playerARatingDiff).toBeGreaterThan(0)
                expect(nextPlayerBRating).toBeLessThan(playerBRating)
                expect(playerBRatingDiff).toBeLessThan(0)
            })
        })

        describe('asymmetric system', () => {
            describe('given player ratings and score, asymmetric system allows larger changes in certain player', () => {
                it('playerB heavily favored and loses should maximize K and match the asymmetric values', () => {
                    // Arrange
                    const playerARating = 1000
                    const playerBRating = 2000
                    const playerAScore = 1

                    // Act
                    const symmetricNextRatingInfo = ratingSystem.getNextRatings(playerARating, playerBRating, playerAScore)
                    const asymmetricNextRatingInfo = asymmetricRatingSystem.getNextRatings(playerARating, playerBRating, playerAScore)

                    // Assert
                    expect(symmetricNextRatingInfo.playerBProbability).toBeGreaterThan(0.99)
                    expect(symmetricNextRatingInfo.playerARatingDiff).toBe(symmetricKFactor)
                    expect(symmetricNextRatingInfo.playerBRatingDiff).toBe(-symmetricKFactor)

                    expect(asymmetricNextRatingInfo.playerARatingDiff).toBe(playerAKFactor)
                    expect(asymmetricNextRatingInfo.playerBRatingDiff).toBe(-playerBKFactor)
                })
            })

            describe('rating is used in computing KFator', () => {
                it('players with rating over 4000 experience lower KFactor', () => {
                    // Arrange
                    const playerARating = 1000
                    const playerBRating = 2000
                    const playerA2Rating = 5000
                    const playerB2Rating = 6000
                    const playerAScore = 1

                    // Act
                    const asymmetricNextRatingInfo = asymmetricRatingSystem.getNextRatings(playerARating, playerBRating, playerAScore)
                    const asymmetricNextRatingInfoHigh = asymmetricRatingSystem.getNextRatings(playerA2Rating, playerB2Rating, playerAScore)

                    // Assert
                    expect(asymmetricNextRatingInfo.playerARatingDiff).toBe(playerAKFactor)
                    expect(asymmetricNextRatingInfo.playerBRatingDiff).toBe(-playerBKFactor)
                    expect(asymmetricNextRatingInfoHigh.playerARatingDiff).toBe(playerAKFactor / 2)
                    expect(asymmetricNextRatingInfoHigh.playerBRatingDiff).toBe(-playerBKFactor / 2)
                })
            })
        })
    })
})