import {singleton} from "tsyringe"
import {Overlay} from "../Overlay"

@singleton()
export class WaveEditor extends Overlay {

    constructor() {
        super("./src/ui/overlays/WaveEditor/WaveEditor.html", () => {

        })
    }
}
