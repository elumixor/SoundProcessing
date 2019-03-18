export function map(value: number, min1: number, max1: number, min2: number, max2: number): number {
    return (value - min1) / (max1 - min1) * (max2 - min2)
}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}

export function degrees(rad: number): number {
    return rad * 180 / Math.PI
}

export function mapI8<U>(arr: Int8Array, fn: (value: number, index: number, array: Int8Array) => U): U[] {
    const newArr: U[] = []
    arr.forEach((v, i, a) => newArr.push(fn(v, i, a)))
    return newArr
}

export function chunk<T>(arr: T[] | Float32Array, chunkSize: number): (T[] | Float32Array)[] {
    const chunks: (T[] | Float32Array)[] = []
    for (let i = 0; i < arr.length; i += chunkSize) {
        chunks.push(arr.slice(i, chunkSize + i))
    }
    return chunks
}

export function sum(arr: number[] | Float32Array): number {
    let s = 0
    arr.forEach((v: number) => s += v)
    return s
}

export function average(arr: number[] | Float32Array): number {
    return sum(arr) / arr.length
}

export function normalized(arr: number[]): number[] {
    const m = Math.max(...arr)
    return arr.map((a, i) => arr[i] = a / m)
}
