import {container, singleton} from "tsyringe"
import {WaveEditor} from "./overlays/WaveEditor/WaveEditor"
import {Overlay} from "./overlays/Overlay"
import {KeyMapper} from "./overlays/KeyMapper/KeyMapper"
import {MidiMapper} from "./overlays/KeyMapper/MidiMapper/MidiMapper"
import {Effects} from "./popups/Effects/Effects"
import {Popup} from "./popups/Popup"
import {SampledWave, setWave, SoundManager} from "../Sound"

@singleton()
export class UI {

    readonly buttons = {
        waveEditor: document.getElementById("waveEditor") as HTMLDivElement,
        keyMapper: document.getElementById("keyMapper") as HTMLDivElement,
        customSound: {
            div: document.getElementById("customSound") as HTMLDivElement,
            input: (() => {
                const el = document.createElement("input") as HTMLInputElement
                el.type = "file"
                el.accept = "audio/*"
                return el
            })()
        }
    }

    readonly overlays = {
        waveEditor: container.resolve(WaveEditor),
        keyMapper: container.resolve(KeyMapper),
        midi: container.resolve(MidiMapper)
    }

    readonly popups = {
        effects: container.resolve(Effects)
    }

    currentOverlay: Overlay | null = null
    currentPopup: Popup | null = null

    showOverlay(overlay: Overlay) {
        if (this.currentOverlay) this.currentOverlay.hide()
        overlay.show()
        this.currentOverlay = overlay
    }

    constructor() {
        this.buttons.waveEditor.onclick = () => this.showOverlay(this.overlays.waveEditor)
        this.buttons.keyMapper.onclick = () => this.showOverlay(this.overlays.keyMapper)

        addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.currentOverlay != null) {
                this.currentOverlay.hide()
                this.currentOverlay = null
            }
        })

        const input = this.buttons.customSound.input

        input.addEventListener("change", () => {
            if (input.files) {
                console.log(input.files)
                const fr = new FileReader()
                fr.onload = e => {
                    //@ts-ignore
                    SoundManager.ctx.decodeAudioData(e.target.result).then(function (buffer) {

                        const source = SoundManager.ctx.createBufferSource()
                        source.buffer = buffer

                        setWave(SampledWave.nonPeriodic(Array.from(buffer.getChannelData(0))))
                    })
                }
                fr.readAsArrayBuffer(input.files[0])
            }
        })

        this.buttons.customSound.div.addEventListener("click", () => input.click())
    }

    showPopup(popup: Popup) {
        if (this.currentPopup) this.currentPopup.hide()
        popup.show()
        this.currentPopup = popup
    }
}
