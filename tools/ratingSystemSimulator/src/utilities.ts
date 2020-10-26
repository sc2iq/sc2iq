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