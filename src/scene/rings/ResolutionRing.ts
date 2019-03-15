import {singleton} from "tsyringe"
import {Renderable} from "../../common/Renderable"
import {SegmentedRing} from "./SegmentedRing"
import {Input} from "../../input/Input"
import {DrawingContext} from "../../DrawingContext"
import {clamp} from "../../util"
import {Settings} from "../../Settings"

@singleton()
export class ResolutionRing extends SegmentedRing implements Renderable {
    constructor(private settings: Settings) {
        super(0, settings.keyCount)
        this.dc.onRepaint.subscribe((dc: DrawingContext) => {
            this.radius = dc.outerRadius
            this.segments.forEach(s => s.radius = this.radius)
        })
    }
}
