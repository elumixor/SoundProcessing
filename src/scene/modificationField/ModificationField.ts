import {singleton} from "tsyringe"
import {Renderable} from "../../common/Renderable"
import {DrawingContext} from "../../DrawingContext"
import {Segment} from "./Segment"
import {Settings} from "../../Settings"
import {Sound} from "../../Sound"
import {Point} from "../../common/Point"

@singleton()
export class ModificationField implements Renderable {
    private segments: Segment[][] = []

    constructor(private dc: DrawingContext, private settings: Settings) {
        dc.onRepaint.subscribe(dc => {
            this.segments = []

            const inner = dc.innerRadius
            const outer = dc.outerRadius
            const diff = outer - inner

            const segHeight = diff / this.settings.maxTravelDistance
            const angle = 2 * Math.PI / this.settings.keyCount

            for (let j = 0; j < this.settings.maxTravelDistance; j++) {
                this.segments.push([])

                const inDist = segHeight * j + inner
                const outDist = segHeight * (j + 1) + inner

                for (let i = 0; i < settings.keyCount; i++) {
                    const a = i * angle
                    this.segments[j].push(new Segment(inDist, outDist, a - angle / 2, a + angle / 2))
                }
            }
        })
    }

    render(): void {
        this.dc.c.moveTo(0, 0)
        this.segments.forEach(r => {
            const grd = this.dc.c.createRadialGradient(0, 0, 0, 0, 0, r[0].outDist)
            grd.addColorStop(0, "black")
            grd.addColorStop(1, "transparent")

            this.dc.c.fillStyle = grd
            r.forEach(segment => segment.render())
        })
    }

    getSegment(distance: number, sector: number): Segment | undefined {
        return this.segments[distance][sector]
    }
}
