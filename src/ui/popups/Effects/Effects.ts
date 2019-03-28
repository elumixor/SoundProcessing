import {Popup} from "../Popup"
import {EventEmitter} from "../../../common/EventEmitter"
import {Effect} from "../../../effects/Effect"
import {Flanger} from "../../../effects/Flanger"

export class Effects extends Popup {
    flanger: HTMLDivElement | null = null
    onChosen = new  EventEmitter<Effect>()

    constructor() {
        super("./src/ui/popups/Effects/Effects.html", () => {
            this.flanger = document.getElementById("effectFlanger") as HTMLDivElement
            this.flanger.addEventListener("click", () => {
                this.onChosen.emit(new Flanger())
                this.hide()
            })
        })
    }
}
