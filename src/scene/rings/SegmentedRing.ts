import {DrawingContext} from "../../DrawingContext"
import {Renderable} from "../../common/Renderable"
import {map} from "../../util"
import {container} from "tsyringe"

export class SegmentedRing implements Renderable {
    protected segments: { color: string, radius: number }[] = []
    protected dc: DrawingContext = container.resolve(DrawingContext)

    constructor(protected radius: number, protected segmentsCount: number) {
        for (let i = 0; i < segmentsCount; i++) {
            this.segments.push({color: "rgba(0,0,0,0.3)", radius: this.radius})
        }
    }

    render(): void {
        // subdivide circle into sectors, depending on current keys count
        for (let i = 0; i < this.segmentsCount; i++) {
            this.dc.c.strokeStyle = this.segments[i].color

            // start from bottom and move clockwise
            this.dc.c.beginPath()
            this.dc.c.arc(0, 0, this.segments[i].radius,
                map((i - .5) / (this.segmentsCount), 0, 1, 0, Math.PI * 2),
                map((i + .5) / (this.segmentsCount), 0, 1, 0, Math.PI * 2))
            this.dc.c.stroke()
            this.dc.c.closePath()
        }
    }
}
