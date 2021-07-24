# @sc2/rating

## Elo Rating System

### Getting started

### Install

```bash
npm install @sc2/rating
```

## Expected Usage

```typescript
import createRatingSystem from '@sc2/rating'

const ratingSystem = createRatingSystem()

const {
    playerAProbability,
    playerBProbability,
    nextPlayerARating,
    playerARatingDiff,
    nextPlayerBRating,
    playerBRatingDiff
} = rating.getNextRatings(playerARating, playerBRating, actualScore)
```

### Manual Usage

```typescript
import createRatingSystem from '@sc2/rating'

const ratingSystem = createRatingSystem()

// ... setup players and execute a game...

const playerA = {
    id: 'playerA',
    rating: 1000,
}

const playerB = {
    id: 'playerB',
    rating: 1200,
}

const [playerAProbability, playerBProbability] = ratingSystem.getExpectedPlayerProbabilities(playerA.rating, playerB.rating)
const aScore = 1
const bScore = 1 - aScore

const [nextPlayerARating, playerADiff] = ratingSystem.getNextRating(playerARating, aScore, playerAProbability)
const [nextPlayerBRating, playerBDiff] = ratingSystem.getNextRating(playerBRating, bScore, playerBProbability)

playerA.rating = nextPlayerARating
playerB.rating = nextPlayerBRating

// ... player more games ...

```

### Details about the K Factor functions

In the next rating function we see a resolver between a function and number such as 32 or a function which accepts the players rating.
This can be used to decrease the factor for more experienced players as seen in: https://en.wikipedia.org/wiki/Elo_rating_system#Most_accurate_K-factor

```typescript
type KFactorFunction = (rating: number) => number

function createNextRatingFn(kFactor: number | KFactorFunction): NextRatingFn {
    const kFactorFn: KFactorFunction = typeof kFactor === 'number'
        ? () => kFactor
        : kFactor

...

kFactorFn(rating)
```

It can even be more advanced and accept the index of player (A - 0, B - 1) and this value would be passed to your function

```typescript
export type KFactorFunctionWithPlayers = (rating: number, playerIndex: number | undefined) => number

....

const aKFactor = (rating: number) => resolvedKFactor(rating, 0)
const bKFactor = (rating: number) => resolvedKFactor(rating, 1)

```