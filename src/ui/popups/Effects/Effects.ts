import {Popup} from "../Popup"
import {EventEmitter} from "../../../common/EventEmitter"
import {Effect} from "../../../effects/Effect"
import {Flanger} from "../../../effects/Flanger"
import {Noise} from "../../../effects/Noise"
import {Segment} from "../../../scene/modificationField/Segment"

export class Effects extends Popup {
    segment: Segment | null = null

    constructor() {
        super("./src/ui/popups/Effects/Effects.html", () => {
            const flanger = document.getElementById("effectFlanger") as HTMLDivElement
            const noise = document.getElementById("effectNoise") as HTMLDivElement

            flanger.addEventListener("click", () => {
                if (this.segment) {
                    this.segment.effect = new Flanger()
                }
                this.hide()
            })
            noise.addEventListener("click", () => {
                if (this.segment) {
                    this.segment.effect = new Noise()
                }
                this.hide()
            })
        })
    }

    chooseFor(segment: Segment) {
        this.segment = segment
    }
}
