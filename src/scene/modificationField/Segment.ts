import {Renderable} from "../../common/Renderable"
import {DrawingContext} from "../../DrawingContext"

export class Segment implements Renderable {
    constructor(public inDist: number, public outDist: number, private a1: number, private a2: number, private dc: DrawingContext) {
    }

    render() {
        this.dc.c.beginPath()
        this.dc.c.arc(0, 0, this.inDist, this.a1, this.a2)
        this.dc.c.arc(0, 0, this.outDist, this.a2, this.a1, true)
        this.dc.c.fill()
        this.dc.c.closePath()
    }
}
