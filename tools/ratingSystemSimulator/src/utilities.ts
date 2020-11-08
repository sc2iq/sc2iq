import { convertResultToDisplayResult, Player, Question, Result } from './models'

export function randomInRange(min: number, max: number) {
    if (max < min) {
        throw new Error(`max ${max} value must be greater or equal min ${min}`)
    }

    const diff = max - min

    return min + Math.floor(Math.random() * diff)
}

export function trunc(n: number, digits: number): number {
    return Math.trunc(n * Math.pow(10, digits)) / Math.pow(10, digits)
}

export function getRandom<T>(xs: T[]): T {
    const randomIndex = randomInRange(0, xs.length - 1)
    const x = xs[randomIndex]

    return x
}

const maxIterations = 1000 * 1000
export function getRandomWhichMeetsConstraints<T>(xs: T[], isValid: (x: T) => boolean): T {
    let x: T | undefined = undefined

    let iteration = 0
    const start = Date.now()
    while (x == undefined) {
        const randomX = getRandom(xs)
        const isXValid = isValid(randomX)

        if (iteration > maxIterations) {
            const now = Date.now()
            const timeDiff = ((now - start) / 1000).toFixed(3)
            console.log(`Max iterations reached when finding question. ${timeDiff} s`)
            x = randomX
        }
        else if (isXValid) {
            x = randomX
        }

        iteration++
    }

    return x
}

export function createCsvFromObjects<T extends Record<string, unknown>>(os: T[]): string {
    if (os.length == 0) {
        throw new Error(`Cannon create CSV from empty list. Given list must not be empty.`)
    }

    const firstResult = os[0]
    const keys = Object.keys(firstResult)

    const headers = keys.join(',')
    const rows = os.map(result => Object.values(result).join(','))

    const csv = `${headers}
${rows.join('\n')}
`

    return csv
}

export function createPlayers(
    prefix: string,
    numPlayers: number,
    initialRating: number,
    segmentSize: number,
    incrementAmount: number
) {
    return Array.from({ length: numPlayers }, (_, i) => i)
        .map<Player>(v => {
            const rating = initialRating + Math.floor(v / segmentSize) * incrementAmount
            return {
                id: `${prefix}${v}`,
                rating
            }
        })
}

export function zip<T1, T2>(
    x1s: T1[],
    x2s: T2[],
): [T1, T2][] {
    const shorterLength = x1s.length < x2s.length
        ? x1s.length
        : x2s.length

    const zipped: [T1, T2][] = []
    for (let i = 0; i < shorterLength; i++) {
        const x1 = x1s[i]
        const x2 = x2s[i]
        zipped.push([x1, x2])
    }

    return zipped
}

export function processResults(
    players: Player[],
    questions: Question[],
    results: Result[],
    numResultsToDisplay: number,
    lastNResults = 1
) {
    const topNresults = results
        .filter((_, i) => i < numResultsToDisplay)
        .map(result => convertResultToDisplayResult(result))

    const playersByRating = [...players].sort((a, b) => a.rating - b.rating)
    const questionsByRating = [...questions].sort((a, b) => a.rating - b.rating)

    const resultsGroupedByPlayer: Map<Player, Result[]> = players.reduce((resultsMap, player) => {
        const playerResults = results.filter(result => result.playerId === player.id)
        resultsMap.set(player, playerResults)
        return resultsMap
    }, new Map<Player, Result[]>())

    const playerRatingsOverTime = [...resultsGroupedByPlayer].map(([player, playerResults]) => playerResults.map(r => r.playerRating))
    const playerRatingsSortedByFinalRating = playerRatingsOverTime.sort((a, b) => {
        const aLastRating = a[a.length - 1]
        const bLastRating = b[b.length - 1]

        return aLastRating - bLastRating
    })

    const topNPlayersWithLowestRating = playersByRating
        .slice(0, numResultsToDisplay)
        .map(player => player.rating)

    const topNQuestionsWithLowestRating = questionsByRating
        .slice(0, numResultsToDisplay)
        .map(player => player.rating)

    const topNPlayersWithHighestRatings = playersByRating
        .slice(-numResultsToDisplay)
        .map(player => player.rating)

    const topNQuestionsWithHighestRatings = questionsByRating
        .slice(-numResultsToDisplay)
        .map(player => player.rating)

    const topNPlayerResultsWithLowestRatings = playerRatingsSortedByFinalRating
        .slice(0, numResultsToDisplay)
        .map(results => results.slice(-lastNResults))

    const topNPlayerResultsWithHighestRatings = playerRatingsSortedByFinalRating
        .slice(-numResultsToDisplay)
        .map(results => results.slice(0, lastNResults))

    return {
        playersByRating,
        questionsByRating,
        resultsGroupedByPlayer,
        topNresults,
        topNPlayersWithLowestRating,
        topNQuestionsWithLowestRating,
        topNPlayersWithHighestRatings,
        topNQuestionsWithHighestRatings,
        topNPlayerResultsWithLowestRatings,
        topNPlayerResultsWithHighestRatings,
    }
}

export function displayResults(results: any) {
    console.log(`Top Results`)
    console.table(results.topNresults)

    console.log(`Players with lowest ratings`)
    console.log(results.topNPlayersWithLowestRating)
    console.log(`Player results with the lowest rating`)
    console.log(results.topNPlayerResultsWithLowestRatings)

    console.log(`Players with highest ratings`)
    console.log(results.topNPlayersWithHighestRatings)
    console.log(`Player results with the lowest rating`)
    console.log(results.topNPlayerResultsWithHighestRatings)

    console.log(`Questions with lowest ratings`)
    console.log(results.topNQuestionsWithLowestRating)
    console.log(`Questions with highest ratings`)
    console.log(results.topNQuestionsWithHighestRatings)
}