export class Point {
    constructor(public x: number = 0, public y: number = 0) {
    }

    distanceTo(another: Point) {
        const dx = this.x - another.x
        const dy = this.y - another.y

        return Math.sqrt(dx * dx + dy * dy)
    }

    sub(another: Point) {
        return new Point(this.x - another.x, this.y - another.y)
    }
}
