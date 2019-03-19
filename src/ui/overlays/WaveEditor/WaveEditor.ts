import {singleton} from "tsyringe"
import {Overlay} from "../Overlay"
import {defaultSoundWaves, SoundWave} from "../../../Sounds"
import {clamp} from "../../../util"

@singleton()
export class WaveEditor extends Overlay {
    wave: SoundWave = defaultSoundWaves[0]
    waveBox: HTMLDivElement | null = null
    envBox: HTMLDivElement | null = null

    shown: HTMLDivElement[] | null = null

    static readonly ampBoxes = (() => {
        const arr: HTMLDivElement[] = []

        for (let i = 0; i < SoundWave.samplesMax; i++) {
            const el = document.createElement("div")
            el.className = "wave-sample"
            arr.push(el)
        }

        return arr
    })()

    private mouseDown = false
    private totalSamples: number | null = null

    private onWaveChange(e: MouseEvent) {
        if (this.mouseDown) {
            const index = Math.floor((clamp((e.x - this.waveBox!.offsetLeft) / this.waveBox!.offsetWidth, 0, 1)) * this.wave.sampleCount)
            const value = -(e.y - this.waveBox!.offsetTop) / this.waveBox!.offsetHeight * 2 + 1
            this.wave.samples[index] = value
            this.repaintWave()
        }
    }

    constructor() {
        super("./src/ui/overlays/WaveEditor/WaveEditor.html", () => {
            this.waveBox = document.getElementById("waveBox") as HTMLDivElement
            this.envBox = document.getElementById("envBox") as HTMLDivElement

            this.waveBox!.addEventListener("mousedown", (e) => {
                this.mouseDown = true
                this.onWaveChange(e)
            })
            this.waveBox!.addEventListener("mouseup", () => {
                this.mouseDown = false
            })
            this.waveBox!.addEventListener("mouseleave", () => {
                this.mouseDown = false
            })
            this.waveBox!.addEventListener("mousemove", (e) => { this.onWaveChange(e) })
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

                const sampleHeight = this.wave.samples[i] / 2 * boxHeight

                if (sampleHeight > 0) {
                    //noinspection JSSuspiciousNameCombination
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
        this.totalSamples = this.wave.sampleCount
        this.shown = WaveEditor.ampBoxes.slice(0, this.totalSamples)
        this.repaintWave()

        this.waveBox!.append(...this.shown)
        super.show()
    }

    setWave(wave: SoundWave) {
        this.wave = wave
    }
}
