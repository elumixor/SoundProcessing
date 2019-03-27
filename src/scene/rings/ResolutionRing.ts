import {singleton} from "tsyringe"
import {Renderable} from "../../common/Renderable"
import {SegmentedRing} from "./SegmentedRing"
import {DrawingContext} from "../../DrawingContext"
import {Settings} from "../../Settings"
import {Sound} from "../../Sound"
import anime from "animejs"

@singleton()
export class ResolutionRing extends SegmentedRing implements Renderable {
    constructor(private settings: Settings) {
        super(0, settings.keyCount)
        this.dc.onRepaint.subscribe((dc: DrawingContext) => {
            this.radius = dc.outerRadius
            this.segments.forEach(s => s.radius = this.radius)
        })
    }

    resolve(sound: Sound): void {
        anime({
            targets: null, duration: 500, update: (anim) => {
                this.segments[this.settings.getSector(sound.key)] =
                    {
                        color: "rgba(0,0,0," + (1 - anim.progress / 100 * 0.7) + ")",
                        radius: this.radius + 20 * (1 - anim.progress / 100) * sound.velocity / 100
                    }
            }, easing: "easeOutQuad"
        })
    }
}
