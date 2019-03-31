import {singleton} from "tsyringe"
import {Overlay} from "../Overlay"
import {setWave, soundWave, SampledWave} from "../../../Sound"
import {clamp} from "../../../util"
import {Settings} from "../../../Settings"
import {Point} from "../../../common/Point"
import {SoundEnvelope} from "../../../Sound"

@singleton()
export class WaveEditor extends Overlay {
    waveBox: HTMLDivElement | null = null
    envBox: HTMLCanvasElement | null = null
    totalDuration: HTMLInputElement | null = null
    dc: CanvasRenderingContext2D | null = null

    shown: HTMLDivElement[] | null = null

    static readonly ampBoxes = (() => {
        const arr: HTMLDivElement[] = []

        for (let i = 0; i < soundWave.samples.length; i++) {
            const el = document.createElement("div")
            el.className = "wave-sample"
            arr.push(el)
        }

        return arr
    })()

    private mouseDown = false
    private totalSamples: number | null = null
    private envContainer: HTMLDivElement | null = null

    private onWaveChange(e: MouseEvent) {
        const samples = [...soundWave.samples]
        samples[Math.floor((clamp((e.x - this.waveBox!.offsetLeft) / this.waveBox!.offsetWidth, 0, 1))
            * soundWave.sampleCount)] = -(e.y - this.waveBox!.offsetTop) / this.waveBox!.offsetHeight * 2 + 1
        setWave(SampledWave.periodic(samples))
        this.repaintWave()
    }

    private static envPercentages(): { delay: number, attack: number, decay: number, sustain: number, release: number } {
        return {
            delay: soundWave.envelope.delay / soundWave.envelope.totalDuration,
            attack: soundWave.envelope.attackDuration / soundWave.envelope.totalDuration,
            decay: soundWave.envelope.decayDuration / soundWave.envelope.totalDuration,
            sustain: soundWave.envelope.sustain / soundWave.envelope.totalDuration,
            release: soundWave.envelope.release / soundWave.envelope.totalDuration
        }
    }

    private static recalculateEnvelope(totalDuration: number) {
        if (!(totalDuration > .1)) return
        const e = this.envPercentages()

        soundWave.envelope = new SoundEnvelope(e.delay * totalDuration,
            e.attack * totalDuration, soundWave.envelope.attackValue, soundWave.envelope.attackConvexity,
            e.decay * totalDuration, soundWave.envelope.decayValue, soundWave.envelope.decayConvexity,
            e.sustain * totalDuration, e.release * totalDuration, soundWave.envelope.releaseConvexity)
    }

    private drawEnvelope() {
        const dc = this.dc as CanvasRenderingContext2D
        const e = WaveEditor.envPercentages()

        dc.clearRect(0, 0, this.dc!.canvas.width, this.dc!.canvas.height)

        dc.lineWidth = 2
        dc.moveTo(0, dc.canvas.height)

        dc.beginPath()
        dc.lineTo(e.delay * dc.canvas.width, dc.canvas.height)
        dc.lineTo((e.delay + e.attack) * dc.canvas.width, (1 - soundWave.envelope.attackValue) * dc.canvas.height)
        dc.lineTo((e.delay + e.attack + e.decay) * dc.canvas.width, (1 - soundWave.envelope.decayValue) * dc.canvas.height)
        dc.lineTo((e.delay + e.attack + e.decay + e.sustain) * dc.canvas.width, (1 - soundWave.envelope.decayValue) * dc.canvas.height)
        dc.lineTo(dc.canvas.width, dc.canvas.height)
        dc.closePath()

        dc.fillStyle = "green"
        dc.fill()
    }

    private envelopeSelected: { name: string, min: number, max: number } | null = null

    private onEnvDrag(e: MouseEvent) {
        const newX = e.x - this.envContainer!.offsetLeft
        const newY = e.y - this.envContainer!.offsetTop

        if (newX > this.envelopeSelected!.min && newX < this.envelopeSelected!.max) {
            const value = 1 - newY / this.dc!.canvas.height
            const time = newX / this.dc!.canvas.width

            let {
                delay, attackDuration, attackValue, attackConvexity,
                decayDuration, decayValue, decayConvexity, sustain, release, releaseConvexity
            } = soundWave.envelope

            switch (this.envelopeSelected!.name) {
                case "delay":
                    delay = time
                    break
                case "attack":
                    attackDuration = time - delay
                    attackValue = value
                    break
                case "decay":
                    decayDuration = time - delay - attackDuration
                    decayValue = value
                    break
                case "sustain":
                    sustain = time - delay - attackDuration - decayDuration
                    break
                case "release":
                    release = time - delay - attackDuration - decayDuration - sustain
                    break
                default:
                    break
            }

            soundWave.envelope = new SoundEnvelope(delay, attackDuration, attackValue, attackConvexity, decayDuration, decayValue, decayConvexity, sustain, release, releaseConvexity)
        }

        this.drawEnvelope()
    }

    private onEnvSelect(e: MouseEvent) {
        const dc = this.dc as CanvasRenderingContext2D
        const clickPoint = new Point(e.x - this.envContainer!.offsetLeft, e.y - this.envContainer!.offsetTop)
        const env = WaveEditor.envPercentages()
        const envPoints = [
            new Point(env.delay * dc.canvas.width, dc.canvas.height),
            new Point((env.delay + env.attack) * dc.canvas.width, (1 - soundWave.envelope.attackValue) * dc.canvas.height),
            new Point((env.delay + env.attack + env.decay) * dc.canvas.width, (1 - soundWave.envelope.decayValue) * dc.canvas.height),
            new Point((env.delay + env.attack + env.decay + env.sustain) * dc.canvas.width, (1 - soundWave.envelope.decayValue) * dc.canvas.height),
            new Point(dc.canvas.width, dc.canvas.height)
        ]

        const labels = ["delay", "attack", "decay", "sustain", "release"]

        let minPoint = 0
        let minDistance = envPoints[minPoint].distanceTo(clickPoint)
        for (let i = 1; i < envPoints.length; i++) {
            let newDistance = envPoints[i].distanceTo(clickPoint)
            if (newDistance < minDistance) {
                minDistance = newDistance
                minPoint = i
            }
        }
        this.envelopeSelected = {
            name: labels[minPoint],
            min: minPoint === 0 ? 0 : envPoints[minPoint - 1].x,
            max: minPoint === envPoints.length - 1 ? dc.canvas.width : envPoints[minPoint + 1].x
        }
    }

    constructor() {
        super("./src/ui/overlays/WaveEditor/WaveEditor.html", () => {
            this.waveBox = document.getElementById("waveBox") as HTMLDivElement
            this.envContainer = document.getElementById("envBoxContainer") as HTMLDivElement
            this.envBox = document.getElementById("envBox") as HTMLCanvasElement
            this.envBox.width = innerWidth * .7
            this.envBox.height = innerHeight * .3

            this.totalDuration = document.getElementById("totalDuration") as HTMLInputElement

            this.dc = this.envBox.getContext("2d")
            this.drawEnvelope()

            this.totalDuration.value = soundWave.envelope.totalDuration.toString()
            this.totalDuration.addEventListener("input", () => {
                WaveEditor.recalculateEnvelope(Number(this.totalDuration!.value))
            })

            this.waveBox!.addEventListener("mousedown", e => {
                this.mouseDown = true
                this.onWaveChange(e)
            })
            this.waveBox!.addEventListener("mouseup", () => {
                this.mouseDown = false
            })
            this.waveBox!.addEventListener("mouseleave", () => {
                //this.mouseDown = false
            })
            this.waveBox!.addEventListener("mousemove", e => { if (this.mouseDown) this.onWaveChange(e) })

            this.envBox!.addEventListener("mousedown", (e) => {
                this.mouseDown = true
                this.onEnvSelect(e)
                this.onEnvDrag(e)
            })
            this.envBox!.addEventListener("mouseup", () => {
                this.mouseDown = false
            })
            this.envBox!.addEventListener("mouseleave", () => {
                //this.mouseDown = false
            })
            this.envBox!.addEventListener("mousemove", e => { if (this.mouseDown) this.onEnvDrag(e) })
        })
    }

    repaintWave() {
        if (this.totalSamples && this.shown) {
            const boxWidth = innerWidth * .7
            const boxHeight = innerHeight * .3
            const sampleWidth = boxWidth / this.totalSamples

            for (let i = 0; i < this.totalSamples; i++) {
                this.shown[i].style.width = sampleWidth + "px"
                this.shown[i].style.left = (boxWidth / 2 + (i - this.totalSamples / 2) * sampleWidth) + "px"

                const sampleHeight = soundWave.samples[i] / 2 * boxHeight

                if (sampleHeight > 0) {
                    this.shown[i].style.top = (boxHeight / 2 - sampleHeight) + "px"
                    this.shown[i].style.bottom = (boxHeight / 2) + "px"
                } else {
                    this.shown[i].style.bottom = (boxHeight / 2 + sampleHeight) + "px"
                    this.shown[i].style.top = (boxHeight / 2) + "px"
                }
            }
        }
    }

    show() {
        this.totalSamples = soundWave.sampleCount
        this.shown = WaveEditor.ampBoxes.slice(0, this.totalSamples)
        this.repaintWave()

        this.waveBox!.append(...this.shown)
        super.show()
    }
}
