import {SampledWave} from "../Sound"

export interface Effect {
    segmentColor: string
    apply(sound: SampledWave): SampledWave
}
