import {container, singleton} from "tsyringe"
import {Overlay} from "../Overlay"
import {MidiMapper} from "./MidiMapper/MidiMapper"
import {UI} from "../../UI"
import {Input} from "../../../input/Input"
import {Settings} from "../../../Settings"

@singleton()
export class KeyMapper extends Overlay {
    keys = ["qwertyuiop[]", "asdfghjkl;'\\", "`zxcvbnm,./"]


    buttons = (() => {
        const rows = []
        for (let i = 0; i < this.keys.length; i++) {
            const row = document.createElement("div")
            row.className = "buttonsRow"
            for (const letter of this.keys[i]) {
                const button = document.createElement("div")
                button.className = "keyButton"
                button.innerText = letter
                button.addEventListener("click", () => {
                    this.hide()
                    this.midi.chooseFor(button, letter, this)
                })
                row.appendChild(button)
            }
            rows.push(row)
        }
        return rows
    })()

    private buttonsContainer: HTMLDivElement | null = null

    constructor(private midi: MidiMapper, private settings: Settings) {
        super("./src/ui/overlays/KeyMapper/KeyMapper.html", () => {
            this.buttonsContainer = document.getElementById("buttonsContainer") as HTMLDivElement
            this.buttonsContainer.append(...this.buttons)
        })
    }

    show() {
        super.show()
    }
}
