import {container, singleton} from "tsyringe"
import {WaveEditor} from "./overlays/WaveEditor/WaveEditor"
import {Overlay} from "./overlays/Overlay"

@singleton()
export class UI {

    readonly buttons = {
        waveEditor: document.getElementById("waveEditor") as HTMLDivElement
    }

    readonly overlays = {
        waveEditor: container.resolve(WaveEditor)
    }

    currentOverlay: Overlay | null = null

    showOverlay(overlay: Overlay) {
        if (this.currentOverlay) this.currentOverlay.hide()
        overlay.show()
        this.currentOverlay = overlay
    }

    constructor() {
        this.buttons.waveEditor.onclick = () => this.showOverlay(this.overlays.waveEditor)
    }
}
