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
export const LowestMidiNote = 21
export const HighestMidiNote = 91

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
            1,
            1,
            1,
            .5,
            1,
            1,
            1,
            1,
            2)
    }
}

export class SoundWave {
    static readonly samplesMax = 256
    sampleCount: number = SoundWave.samplesMax

    private source: AudioBufferSourceNode
    private readonly totalDuration: number
    private readonly gainNode: GainNode
    private readonly buffers: { [note: number]: AudioBuffer }
    private readonly decayDuration: number
    private readonly releaseDuration: number
    private progressStep: { decay: number, release: number }

    constructor(public readonly samples: number[], public readonly envelope: SoundEnvelope) {
        this.totalDuration = this.envelope.delay
            + this.envelope.attackDuration
            + this.envelope.decayDuration
            + this.envelope.sustain
            + this.envelope.release

        this.decayDuration = this.envelope.delay + this.envelope.attackDuration + this.envelope.decayDuration
        this.releaseDuration = this.envelope.sustain + this.envelope.release

        this.progressStep = {
            decay: SoundWave.envelopeStepMs / this.decayDuration,
            release: SoundWave.envelopeStepMs / this.releaseDuration
        }

        this.buffers = (() => {
            const b: { [note: number]: AudioBuffer } = {}
            for (let i = LowestMidiNote; i < HighestMidiNote; i++) {
                const ab = SoundManager.ctx.createBuffer(1, this.sampleCount, this.sampleCount * hertz(i))

                const c1 = ab.getChannelData(0)
                for (let j = 0; j < c1.length; j++) c1[j] = this.samples[j]

                b[i] = ab
            }

            return b
        })()

        this.source = SoundManager.ctx.createBufferSource()
        this.gainNode = SoundManager.ctx.createGain()
        this.gainNode.gain.setValueAtTime(0.1, 0)
    }

    private isPlaying = false

    private static readonly envelopeStepMs = 10

    private interval = 0
    private progress = 0

    play(note: number) {
        console.log("playni");

        SoundManager.ctx.resume()
        this.source = SoundManager.ctx.createBufferSource()
        this.source.buffer = this.buffers[note]
        this.source.loop = true

        this.gainNode.gain.setValueAtTime(0.1, 0)

        this.gainNode.gain.cancelScheduledValues(0)
        this.gainNode.gain.setValueCurveAtTime([0, this.envelope.attackValue],
            this.envelope.delay, this.envelope.attackDuration)
        this.gainNode.gain.setValueCurveAtTime([this.envelope.attackValue, this.envelope.decayValue],
            this.envelope.delay + this.envelope.attackDuration, this.envelope.decayDuration)

        this.source.connect(this.gainNode)
        this.gainNode.connect(SoundManager.ctx.destination)
        this.source.start()
        this.isPlaying = true
    }

    release() {
        console.log("release");
        if (this.isPlaying && this.source) this.source.stop()
        this.isPlaying = false

        //this.gainNode.gain.cancelScheduledValues(0)
        //this.gainNode.gain.setValueCurveAtTime([this.gainNode.gain.value, 0], 0, this.envelope.release)
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
