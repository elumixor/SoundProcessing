import {Effect} from "./Effect"
import {SampledWave} from "../Sound"

export class Flanger implements Effect {
    offset = 55
    mix = .5

    apply(sound: SampledWave): SampledWave {
        const newSamples: number[] = []
        for (let i = 0; i < sound.samples.length; i++)
            newSamples.push(sound.samples[i] * (1 - this.mix) +
                sound.samples[(i + this.offset) % sound.samples.length] * this.mix)

        return new SampledWave(newSamples)
    }

    segmentColor: string = "blue"
}
