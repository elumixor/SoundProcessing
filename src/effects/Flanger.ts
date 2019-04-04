import {Effect} from "./Effect"
import {SampledWave} from "../Sound"
import {SampleRate} from "../Settings"

export class Flanger implements Effect {

    // todo dynamic params?
    offsetMs = 15
    oscHz = 1/2 // one cycle per *two* seconds
    mix = .5

    getOffset(sample: number): number {
        return Math.cos(sample/SampleRate * this.oscHz * 2 * Math.PI) * this.offsetMs
    }

    apply(sound: SampledWave): SampledWave {
        const newSamples: number[] = []
        for (let i = 0; i < sound.samples.length; i++)
            newSamples.push(sound.samples[i] * (1 - this.mix) +
                sound.samples[Math.round(i + this.getOffset(i)) % sound.samples.length] * this.mix)

        return new SampledWave(newSamples,sound.envelope)
    }

    segmentColor: string = "blue"
}
