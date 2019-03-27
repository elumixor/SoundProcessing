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
        soundWave.at(key).play()
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
            0,
            1,
            2)
    }
}

class PlayableWave {
    private readonly gainNode: GainNode
    private readonly totalDuration: number
    private readonly decayDuration: number
    private readonly releaseDuration: number

    constructor(private readonly source: AudioBufferSourceNode, private readonly envelope: SoundEnvelope) {
        this.gainNode = SoundManager.ctx.createGain()

        this.totalDuration = this.envelope.delay
            + this.envelope.attackDuration
            + this.envelope.decayDuration
            + this.envelope.sustain
            + this.envelope.release

        this.decayDuration = this.envelope.delay + this.envelope.attackDuration + this.envelope.decayDuration
        this.releaseDuration = this.envelope.sustain + this.envelope.release
    }

    play() {
        this.gainNode.gain.cancelScheduledValues(0)
        this.gainNode.gain.setValueAtTime(SoundManager.ctx.currentTime, 0)

        this.gainNode.gain.setValueCurveAtTime([0, this.envelope.attackValue],
            SoundManager.ctx.currentTime + this.envelope.delay,
            this.envelope.attackDuration)

        this.gainNode.gain.setValueCurveAtTime([this.envelope.attackValue, this.envelope.decayValue],
            SoundManager.ctx.currentTime + this.envelope.delay + this.envelope.attackDuration,
            this.envelope.decayDuration)

        this.gainNode.gain.setValueCurveAtTime([this.envelope.decayValue, 0],
            SoundManager.ctx.currentTime + this.envelope.delay + this.envelope.attackDuration
            + this.envelope.decayDuration + this.envelope.sustain,
            this.envelope.release)

        this.source.connect(this.gainNode)
        this.gainNode.connect(SoundManager.ctx.destination)
        this.source.start()

        setTimeout(() => {
            this.gainNode.disconnect()
            this.source.disconnect()
            this.source.stop(0)
        },(this.envelope.delay + this.envelope.attackDuration
            + this.envelope.decayDuration + this.envelope.sustain + this.envelope.release) * 1000)
    }
}

export class SampledWave {
    static readonly samplesMax = 256
    sampleCount: number = SampledWave.samplesMax
    private readonly buffer: AudioBuffer

    constructor(public readonly samples: number[]) {

        this.buffer = SoundManager.ctx.createBuffer(1, this.sampleCount, this.sampleCount * hertz(LowestMidiNote))
        const c1 = this.buffer.getChannelData(0)
        for (let j = 0; j < c1.length; j++) c1[j] = this.samples[j]
    }

    at(note: number): PlayableWave {
        const src = SoundManager.ctx.createBufferSource()
        src.buffer = this.buffer
        src.detune.value = (note - LowestMidiNote) * 100
        console.log(src.detune.value);

        src.loop = true

        return new PlayableWave(src, SoundEnvelope.default)
    }
}

export const defaultSoundWaves = [
    // Sine wave
    new SampledWave((() => {
        const arr: number[] = []
        for (let i = 0; i < SampledWave.samplesMax; i++) {
            arr.push(Math.sin(i / SampledWave.samplesMax * 2 * Math.PI))
        }
        return arr
    })())

    // Square

    // Saw

    // Cut sine

    // Noise

    // Custom preset
]

export let soundWave = defaultSoundWaves[0]

export function setWave(wave: SampledWave) {
    soundWave = wave
}
