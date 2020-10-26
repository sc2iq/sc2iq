import createRatingSystem from './index'

const exponentDenominator = 400
const exponentBase = 10
const kFactor = 32

const rating = createRatingSystem(exponentBase, exponentDenominator, kFactor)

describe('ELO rating system', () => {
    describe('expectedPlayerARating', () => {
        it('given player A has EQUAL rating as player B, expected rating should be 0.5', () => {
            // Arrange
            const playerARating = 1000
            const playerBRating = 1000

            // Act
            const [a, b] = rating.getExpectedPlayerProbabilities(playerARating, playerBRating)

            // Assert
            expect(a).toBe(0.5)
            expect(b).toBe(0.5)
        })

        it('given player A has HIGHER rating than player B, expected rating should be > 0.5', () => {
            // Arrange
            const playerARating = 1200
            const playerBRating = 1000

            // Act
            const [a, b] = rating.getExpectedPlayerProbabilities(playerARating, playerBRating)

            // Assert
            expect(a).toBeGreaterThan(0.5)
            expect(b).toBeLessThan(0.5)
        })

        it('given player A has LOWER rating than player B, expected rating should be < 0.5', () => {
            // Arrange
            const playerARating = 1000
            const playerBRating = 1200

            // Act
            const [a, b] = rating.getExpectedPlayerProbabilities(playerARating, playerBRating)

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
            const [nextRating, change] = rating.getNextRating(playerRating, actualOutcome, expectedOutcome)
            
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
            const [nextRating, change] = rating.getNextRating(playerRating, actualOutcome, expectedOutcome)
            
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
            const [nextRating, change] = rating.getNextRating(playerRating, actualOutcome, expectedOutcome)
            
            // Assert
            expect(nextRating).toBeLessThan(playerRating)
            expect(change).toBeLessThan(0)
        })
    })
})