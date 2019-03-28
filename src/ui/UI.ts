import {container, singleton} from "tsyringe"
import {WaveEditor} from "./overlays/WaveEditor/WaveEditor"
import {Overlay} from "./overlays/Overlay"
import {KeyMapper} from "./overlays/KeyMapper/KeyMapper"
import {MidiMapper} from "./overlays/KeyMapper/MidiMapper/MidiMapper"
import {Effects} from "./popups/Effects/Effects"
import {Popup} from "./popups/Popup"

@singleton()
export class UI {

    readonly buttons = {
        waveEditor: document.getElementById("waveEditor") as HTMLDivElement,
        keyMapper: document.getElementById("keyMapper") as HTMLDivElement
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
            if(e.key === "Escape" && this.currentOverlay != null) {
                this.currentOverlay.hide()
                this.currentOverlay = null
            }
        })
    }

    showPopup(popup: Popup) {
        if (this.currentPopup) this.currentPopup.hide()
        popup.show()
        this.currentPopup = popup
    }
}
