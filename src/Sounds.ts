import {container, singleton} from "tsyringe"
import {Input} from "./input/Input"
import {Settings} from "./Settings"
import {ModificationField} from "./scene/modificationField/ModificationField"
import {ResolutionRing} from "./scene/rings/ResolutionRing"

export class Sound {
    static settings = container.resolve(Settings)
    static mf = container.resolve(ModificationField)
    static rr = container.resolve(ResolutionRing)
    private sector: number
    private _travelled = 0

    get travelled(): number {
        return this._travelled
    }

    constructor(public key: number, public velocity: number) {
        this.sector = Sound.settings.getSector(key)
        this.move()
    }

    move(): void {
        if (this.travelled < Sound.settings.maxTravelDistance) {
            Sound.mf.triggerSegment(this)
            this._travelled++


            setTimeout(() => {
                this.move()
            }, Sound.settings.travelTime)
        } else {
            Sound.rr.resolve(this)
        }
    }
}

@singleton()
export class SoundManager {
    constructor(private input: Input) {
        input.onKeyPressed.subscribe(k => {
            // on key:
            //  set to fired
            //  on quantization -> produce sound
            // ignore remaining sounds...
            // reset on next frame
            // todo don't fire if quntisation delay hasn't yet passed
            new Sound(k.key, k.velocity)
        })

    }
}
