import {singleton} from "tsyringe"

export const AFrequency = 440
export const AMidi = 69
export const OctaveSemitones = 12
export const LowestMidiNote = 21
export const HighestMidiNote = 91
export const SampleRate = 44_100
export const SamplesPerCycle = Math.round(SampleRate / AFrequency)

@singleton()
export class Settings {
    private _key2Midi: { [key: string]: number } = {
        "a": AMidi - 9,
        "w": AMidi - 8,
        "s": AMidi - 7,
        "e": AMidi - 6,
        "d": AMidi - 5,
        "f": AMidi - 4,
        "t": AMidi - 3,
        "g": AMidi - 2,
        "y": AMidi - 1,
        "h": AMidi,
        "u": AMidi + 1,
        "j": AMidi + 2,
        "k": AMidi + 3,
    }
    private _midi2Midi: { [key: number]: number } = {}

    /** Keyboard mappings */
    get midi2Midi(): { [p: number]: number } {
        return this._midi2Midi
    }

    /** Midi mappings */
    get key2Midi(): { [p: string]: number } {
        return this._key2Midi
    }

    readonly standardKeyRange = {min: 21, max: 108}

    /** Total distinct keys in current mapping */
    get keyCount(): number {
        return Math.max(Object.keys(this._midi2Midi).length, Object.keys(this._key2Midi).length)
    }

    /** Maximum number of segments direct sounds passes through when it travels from
     * keyboard ring to resolution ring */
    maxTravelDistance: number = 6

    constructor() {
        // Create mappings
        for (let i = this.standardKeyRange.min; i <= this.standardKeyRange.max; i++)
            this._midi2Midi[i] = i
    }

    getSector(key: number): number {
        return key - this.standardKeyRange.min
    }

    // todo get wrt to quantisation and total speed

    /** Time in ms that takes for the sound to travel between segments */
    travelTime = 400
}
