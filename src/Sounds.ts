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
    static readonly ctx = new AudioContext()

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

export const AFrequency = 440
export const AMidi = 69
export const OctaveSemitones = 12

export function hertz(midi: number) {
    return Math.pow(2, (midi - AMidi) / OctaveSemitones) * AFrequency
}

export function midi(hertz: number) {
    return 12 * Math.log(hertz / AFrequency) / Math.log(2) + AMidi
}

export class SoundEnvelope {
    constructor(public delay: number,
                public attackDuration: number,
                public attackValue: number,
                public attackConvexity: number,
                public decayValue: number,
                public decayDuration: number,
                public decayConvexity: number,
                public sustain: number,
                public release: number,
                public releaseConvexity: number) {}

    static get default(): SoundEnvelope {
        return new SoundEnvelope(0,
            0,
            1,
            1,
            1,
            0,
            1,
            0,
            1,
            2)
    }
}

export class SoundWave {
    static readonly samplesMax = 256
    sampleCount: number = SoundWave.samplesMax

    private source: AudioBufferSourceNode | null
    private readonly totalDuration: number
    private audioBuffer: AudioBuffer
    private readonly totalSamples: number

    constructor(public readonly samples: number[], private envelope: SoundEnvelope) {
        this.totalDuration = this.envelope.delay
            + this.envelope.attackDuration
            + this.envelope.decayDuration
            + this.envelope.sustain
            + this.envelope.release

        let sampleRate = SoundManager.ctx.sampleRate
        this.totalSamples = sampleRate * this.totalDuration
        this.audioBuffer = SoundManager.ctx.createBuffer(1, this.totalSamples, sampleRate)
        this.source = SoundManager.ctx.createBufferSource()
    }

    private isPlaying = false

    play(freq: number) {
        SoundManager.ctx.resume()

        const totalCycles = this.totalDuration * freq
        const samplesPerCycle = this.totalSamples / totalCycles
        this.audioBuffer = SoundManager.ctx.createBuffer(1, this.totalSamples, SoundManager.ctx.sampleRate)

        const c1 = this.audioBuffer.getChannelData(0)
        for (let i = 0; i < c1.length; i++) {
            // todo add interpolation
            c1[i] = this.samples[Math.round((i % samplesPerCycle) / samplesPerCycle * this.sampleCount)]
        }

        if (!this.source) this.source = SoundManager.ctx.createBufferSource()
        else this.source.stop()
        this.source.buffer = this.audioBuffer
        this.source.loop = true
        this.source.connect(SoundManager.ctx.destination)
        this.source.start()
        this.isPlaying = true
    }

    release() {
        if (this.isPlaying && this.source) this.source.stop()
        this.isPlaying = false
        this.source = null
    }
}

export const defaultSoundWaves = [
    // Sine wave
    new SoundWave((() => {
        const arr: number[] = []
        for (let i = 0; i < SoundWave.samplesMax; i++) {
            arr.push(Math.sin(i / SoundWave.samplesMax * 2 * Math.PI))
        }
        return arr
    })(), SoundEnvelope.default)

    // Square

    // Saw

    // Cut sine

    // Noise

    // Custom preset
]
