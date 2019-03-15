import {singleton} from "tsyringe"
import {EventEmitter} from "../common/EventEmitter"
import {Settings} from "../Settings"

export class KeyPressedEvent {
    constructor(public readonly key: number,
                public readonly velocity: number) {}
}

@singleton()
export class Input {
    // Events
    readonly onKeyPressed = new EventEmitter<KeyPressedEvent>()
    readonly onKeyReleased = new EventEmitter<number>()
    readonly onSustainPressed = new EventEmitter<void>()
    readonly onSustainReleased = new EventEmitter<void>()

    /** Velocity on pressing keyboard */
    private static keyboardVelocity: number = 90


    /** Midi interaction */
    private readonly onMidiMessage = (message: any) => {
        const command = message.data[0]
        const note = message.data[1]
        const velocity = (message.data.length > 2) ? message.data[2] : 0

        if (note) {
            if (command !== 176) {
                if (velocity > 0) this.onKeyPressed.emit(new KeyPressedEvent(this.settings.midi2Midi[note], velocity))
                else this.onKeyReleased.emit(this.settings.midi2Midi[note])
            } else {
                if (velocity > 0) this.onSustainPressed.emit()
                else this.onSustainReleased.emit()
            }
        }
    }

    constructor(private settings: Settings) {

        // Subscribe to midi events
        navigator.requestMIDIAccess()
            .then((midiAccess: any) => midiAccess.inputs
                .forEach((x: any) => x.onmidimessage = this.onMidiMessage))

        // Keyboard interaction
        window.onkeydown = e => {
            const k = this.settings.key2Midi[e.key]
            if (k)
                this.onKeyPressed.emit(new KeyPressedEvent(k, Input.keyboardVelocity))
        }
        window.onkeyup = e => {
            const k = this.settings.key2Midi[e.key]
            if (k)
                this.onKeyReleased.emit(k)
        }
    }

}
