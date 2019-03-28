import {Effect} from "./Effect"
import {SampledWave} from "../Sound"

export class Noise implements Effect {
    mix = .1

    apply(sound: SampledWave): SampledWave {
        const newSamples: number[] = []
        for (let i = 0; i < sound.samples.length; i++) {
            newSamples.push((Math.random() * 2 - 1) * this.mix + sound.samples[i] * (1 - this.mix))
        }
        return new SampledWave(newSamples)
    }

    segmentColor: string = "grey"
}
