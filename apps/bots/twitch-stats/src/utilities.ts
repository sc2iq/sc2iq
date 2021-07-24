
export function zip<T1, T2>(xs: T1[], ys: T2[]): { a: T1, b: T2 }[] {
    if (xs.length !== ys.length) {
        throw new Error(`You attempted to zip to lists which were not the same length! xs is ${xs.length} and ys is ${ys.length}`)
    }

    const zipped = xs.map((x, i) => {
        const y = ys[i]

        return { a: x, b: y }
    })

    return zipped
}