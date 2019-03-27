import {singleton} from "tsyringe"
import {Overlay} from "../../Overlay"
import {Settings} from "../../../../Settings"
import {KeyMapper} from "../KeyMapper"

@singleton()
export class MidiMapper extends Overlay {
    private buttonsContainer: HTMLDivElement | null = null

    private static readonly keyNames = ["C", "C", "D", "D", "E", "F", "F", "G", "G", "A", "A", "B"]

    private keys = (() => {
        const keys: HTMLDivElement[] = []
        for (let i = this.settings.standardKeyRange.min; i <= this.settings.standardKeyRange.max; i++) {
            const key = document.createElement("div")
            const remainder = i % 12
            const isSharp = (remainder === 10 || remainder === 1 || remainder === 3
                || remainder === 6 || remainder === 8)
            key.className = "midiKey " + (isSharp ? "black" : "white")
            const octave = Math.floor(i / 12) - 1
            const name = MidiMapper.keyNames[remainder]
            key.innerHTML = `<span>${name}${octave}${isSharp ? "#" : ""}</span>`
            key.setAttribute("note", i.toString())
            key.addEventListener("click", () => {
                this.currentButton!.setAttribute("note", i.toString())
                this.km!.show()
                this.settings.key2Midi[this.letter as string] = i
                this.hide()
            })
            keys.push(key)
        }

        return keys
    })()

    constructor(private settings: Settings) {
        super("./src/ui/overlays/KeyMapper/MidiMapper/MidiMapper.html", () => {
            this.buttonsContainer = document.getElementById("midiContainer") as HTMLDivElement
            this.buttonsContainer.append(...this.keys)
        })
    }

    currentButton: HTMLDivElement | null = null
    letter: string | null = null
    km: KeyMapper | null = null

    chooseFor(button: HTMLDivElement, letter: string, keyMapper: KeyMapper) {
        this.show()
        this.currentButton = button
        this.letter = letter
        this.km = keyMapper
    }
}
