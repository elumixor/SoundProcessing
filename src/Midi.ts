import {singleton} from "tsyringe"
import {EventEmitter} from "./eventEmitter"
import {clamp, map} from "./util"
import {Settings} from "./settings"

@singleton()
export class Midi {
    readonly onKeyPressed = new EventEmitter<{ key: number, velocity: number }>()
    readonly onKeyReleased = new EventEmitter<number>()
    readonly onSustainPressed = new EventEmitter<void>()
    readonly onSustainReleased = new EventEmitter<void>()

    private mappings: { [key: number]: number } = {}
    private readonly standardKeys = {min: 21, max: 108}

    getMappedKey(key: number): number {
        return this.mappings[clamp(key, this.standardKeys.min, this.standardKeys.max)]
    }

    constructor(private settings: Settings) {
        const getMIDIMessage = (message: any) => {
            const command = message.data[0]
            const note = message.data[1]
            const velocity = (message.data.length > 2) ? message.data[2] : 0 // a velocity value might not be included
            // with a noteOff command

            if (note) {
                if (command !== 176) {
                    if (velocity > 0) {
                        this.onKeyPressed.emit({key: note, velocity: velocity})
                    } else {
                        this.onKeyReleased.emit(note)
                    }
                } else {
                    if (velocity > 0) {
                        this.onSustainPressed.emit()
                    } else {
                        this.onSustainReleased.emit()
                    }
                }
            }
        }

        const onMIDISuccess = (midiAccess: any) => {
            midiAccess.inputs.forEach((x: any) => x.onmidimessage = getMIDIMessage)
        }

        navigator.requestMIDIAccess()
            .then(onMIDISuccess)

        const keysInMapping = (this.standardKeys.max - this.standardKeys.min) / settings.keys
        const offset = 30

        for (let i = this.standardKeys.min; i <= this.standardKeys.max; i++) {
            this.mappings[i] = Math.floor(map(i, this.standardKeys.min, this.standardKeys.max, 0, settings.keys))
        }
    }
}
