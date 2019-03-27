export class Point {
    constructor(public x: number, public y: number) {
    }

    distanceTo(another: Point) {
        const dx = this.x - another.x
        const dy = this.y - another.y

        return Math.sqrt(dx * dx + dy * dy)
    }
}
