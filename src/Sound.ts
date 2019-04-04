import {container, singleton} from "tsyringe"
import {Input} from "./input/Input"
import {AFrequency, AMidi, OctaveSemitones, SampleRate, SamplesPerCycle, Settings} from "./Settings"
import {ModificationField} from "./scene/modificationField/ModificationField"
import {ResolutionRing} from "./scene/rings/ResolutionRing"
import {interpolateArray} from "./util"
import {Flanger} from "./effects/Flanger"

export class Sound {
    static settings = container.resolve(Settings)
    static mf = container.resolve(ModificationField)
    static rr = container.resolve(ResolutionRing)
    private sector: number
    private _travelled = 0
    private sound: SampledWave

    get travelled(): number {
        return this._travelled
    }

    constructor(public key: number, public velocity: number) {
        this.sector = Sound.settings.getSector(key)
        this.sound = soundWave.copy()
        this.sound.note = key * 100
        this.sound.play()
        this.move()
    }

    move(): void {
        if (this.travelled < Sound.settings.maxTravelDistance) {
            const segment = Sound.mf.getSegment(this.travelled, Sound.settings.getSector(this.key))
            if (segment) {
                segment.activate()
                if (segment.effect) this.sound = segment.effect.apply(this.sound)
            }
            this._travelled++

            setTimeout(() => {
                this.move()
            }, Sound.settings.travelTime)
        } else {
            this.sound = this.sound.copy()
            this.sound.note = this.key * 100
            this.sound.play()
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

export function hertz(midi: number) {
    return Math.pow(2, (midi - AMidi) / OctaveSemitones) * AFrequency
}

export function midi(hertz: number) {
    return 12 * Math.log(hertz / AFrequency) / Math.log(2) + AMidi
}

export class SoundEnvelope {
    readonly totalDuration: number
    readonly totalDecay: number
    readonly totalRelease: number

    constructor(public readonly delay: number,
                public readonly attackDuration: number,
                public readonly attackValue: number,
                public readonly attackConvexity: number,
                public readonly decayDuration: number,
                public readonly decayValue: number,
                public readonly decayConvexity: number,
                public readonly sustain: number,
                public readonly release: number,
                public readonly releaseConvexity: number) {
        this.totalDuration = this.delay + this.attackDuration + this.decayDuration + this.sustain + this.release
        this.totalDecay = this.delay + this.attackDuration + this.decayDuration
        this.totalRelease = this.sustain + this.release
    }

    static get default(): SoundEnvelope {
        return new SoundEnvelope(0,
            .1, 1, 1,
            1, .5, 1,
            1,
            .3, 2)
    }

    static constant(totalDuration: number): SoundEnvelope {
        return new SoundEnvelope(0,
            0, 1, 1,
            totalDuration, 1, 1,
            0,
            0, 0)
    }
}

export class SampledWave {
    private readonly buffer: AudioBuffer
    private readonly gainNode: GainNode
    /** Note in cents */
    private _note = AMidi * 100
    private source: AudioBufferSourceNode

    get note() { return this._note }

    set note(toCents: number) {
        this._note = toCents
        this.source.detune.value = toCents - AMidi * 100
    }
    bend(cents: number) {
        this.note = this.note + cents
    }

    get sampleCount(): number {
        return this.samples.length
    }

    // todo recalculate on setEnvelope

    static periodic(samples: number[], envelope: SoundEnvelope = SoundEnvelope.default): SampledWave {
        const newArr = interpolateArray(samples, SamplesPerCycle)
        const bArr: number[] = []

        for (let i = 0; i < envelope.totalDuration * SampleRate; i++) {
            bArr[i] = newArr[i % newArr.length]
        }

        return new SampledWave(bArr, envelope)
    }

    static nonPeriodic(samples: number[], sampleRate?: number): SampledWave {
        return new SampledWave(samples, SoundEnvelope.constant(samples.length / (sampleRate || SampleRate)))
    }

    constructor(public readonly samples: number[],
                public envelope: SoundEnvelope) {
        this.buffer = SoundManager.ctx.createBuffer(1, envelope.totalDuration * SampleRate, SampleRate)
        const c1 = this.buffer.getChannelData(0)
        for (let j = 0; j < c1.length; j++) c1[j] = this.samples[j % this.samples.length]
        this.gainNode = SoundManager.ctx.createGain()
        this.source = SoundManager.ctx.createBufferSource()
        this.source.buffer = this.buffer
        this.source.loop = false
    }

    copy(): SampledWave {
        return new SampledWave(this.samples, this.envelope)
    }

    play() {
        this.gainNode.gain.cancelScheduledValues(0)
        this.gainNode.gain.setValueAtTime(SoundManager.ctx.currentTime, 0)

        if (this.envelope.attackDuration > 0)
            this.gainNode.gain.setValueCurveAtTime([0, this.envelope.attackValue],
                SoundManager.ctx.currentTime + this.envelope.delay,
                this.envelope.attackDuration)

        this.gainNode.gain.setValueCurveAtTime([this.envelope.attackValue, this.envelope.decayValue],
            SoundManager.ctx.currentTime + this.envelope.delay + this.envelope.attackDuration,
            this.envelope.decayDuration)

        if (this.envelope.release > 0)
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
        }, (this.envelope.delay + this.envelope.attackDuration
            + this.envelope.decayDuration + this.envelope.sustain + this.envelope.release) * 1000)
    }

    private static readonly defaultSamples = SamplesPerCycle
    static readonly defaults = [
        // Sine wave
        (() => {
            const arr: number[] = []
            for (let i = 0; i < SampledWave.defaultSamples; i++) {
                arr.push(Math.sin(i / SampledWave.defaultSamples * 2 * Math.PI))
            }
            return SampledWave.periodic(arr, SoundEnvelope.default)
        })()

        // Square

        // Saw

        // Cut sine

        // Noise

        // Custom preset
    ]
}

export let soundWave = SampledWave.defaults[0]

export function setWave(wave: SampledWave) {
    soundWave = wave
}
