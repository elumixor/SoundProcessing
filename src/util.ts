export function map(value: number, min1: number, max1: number, min2: number, max2: number): number {
    return (value - min1) / (max1 - min1) * (max2 - min2)
}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}
