import {container, singleton} from "tsyringe"
import {Input} from "./input/Input"
import {Settings} from "./Settings"

export class Sound {
    static settings = container.resolve(Settings)

    private sector: number
    private travelled = 0

    constructor(private key: number, private velocity: number) {
        this.sector = Sound.settings.getSector(key)
        this.move()
    }

    move(): void {
        if (this.travelled < Sound.settings.maxTravelDistance) {
            console.log(`tavelled: ${this.key} ${this.travelled}`)
            this.travelled++

            setTimeout(() => {
                this.move()
            }, 400)
        }
    }
}

@singleton()
export class SoundManager {
    constructor(private input: Input) {
        input.onKeyPressed.subscribe(k => {
            new Sound(k.key, k.velocity)
        })

    }
}
