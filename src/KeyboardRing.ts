//import {DrawingContext} from "./drawingContext"
import {singleton} from "tsyringe"
import {DrawingContext} from "./drawingContext"
import {Settings} from "./settings"
import {map} from "./util"
import {Midi} from "./midi"
import anime, {easings} from "animejs"

@singleton()
export class KeyboardRing {
    private radius: number = 30
    private segments: { color: string, radius: number }[] = []

    constructor(private dc: DrawingContext, private settings: Settings, private midi: Midi) {
        for (let i = 0; i < settings.keys; i++) {
            this.segments.push({color: "rgba(0,0,0,0.3)", radius: this.radius})
        }

        midi.onKeyPressed.subscribe((data: { key: number, velocity: number }) => {
            anime({
                targets: null, duration: 500, update: (anim) => {
                    this.segments[this.midi.getMappedKey(data.key)] =
                        {
                            color: "rgba(0,0,0," + (1 - anim.progress / 100 * 0.7) + ")",
                            radius: this.radius + 20 * (1 - anim.progress / 100) * data.velocity / 100
                        }
                }, easing: "easeOutQuad"
            })
        })
    }

    render() {
        this.dc.c.lineWidth = 1
        // subdivide circle into sectors, depending on current keys count
        for (let i = 0; i < this.settings.keys; i++) {
            this.dc.c.strokeStyle = this.segments[i].color

            // start from bottom and move clockwise
            this.dc.c.beginPath()
            this.dc.c.arc(this.dc.width / 2, this.dc.height / 2, this.segments[i].radius,
                map((i) / (this.settings.keys), 0, 1, 0, Math.PI * 2),
                map((i + 1) / (this.settings.keys), 0, 1, 0, Math.PI * 2))
            this.dc.c.stroke()
            this.dc.c.closePath()
        }
    }
}
