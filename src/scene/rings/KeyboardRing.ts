import {singleton} from "tsyringe"
import anime from "animejs"
import {Renderable} from "../../common/Renderable"
import {Input, KeyPressedEvent} from "../../input/Input"
import {SegmentedRing} from "./SegmentedRing"
import {DrawingContext} from "../../DrawingContext"
import {Settings} from "../../Settings"

@singleton()
export class KeyboardRing extends SegmentedRing implements Renderable {
    constructor(private input: Input, private settings: Settings) {
        super(0, settings.keyCount)
        this.dc.onRepaint.subscribe((dc: DrawingContext) => {
            this.radius = dc.innerRadius
            this.segments.forEach(s => s.radius = this.radius)
        })

        input.onKeyPressed.subscribe((data: KeyPressedEvent) => {
            anime({
                targets: null, duration: 500, update: (anim) => {
                    this.segments[this.settings.getSector(data.key)] =
                        {
                            color: "rgba(0,0,0," + (1 - anim.progress / 100 * 0.7) + ")",
                            radius: this.radius + 20 * (1 - anim.progress / 100) * data.velocity / 100
                        }
                }, easing: "easeOutQuad"
            })
        })
    }
}
