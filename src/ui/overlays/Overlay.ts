import {Component} from "../Component"
import {createElement} from "../dom"
import anime from "animejs"

export class Overlay extends Component {
    private readonly overlay = createElement("div", ["overlay"])
    private readonly contentNode = createElement("div", ["overlay-content"])
    private animation: anime.AnimeInstance | null = null

    constructor(templateUrl: string, afterParsed: () => any = () => {}) {
        super(templateUrl, () => {
            this.content!.childNodes.forEach(n => this.contentNode!.appendChild(n))
            afterParsed()
        })

        this.overlay.style.display = this.contentNode.style.display = "none"
        this.hide()

        this.overlay.addEventListener("click", () => {
            this.hide()
        })
    }

    show() {
        this.overlay.style.display = this.contentNode.style.display = "initial"

        if (this.animation) this.animation.pause()
        this.animation = anime(
            {
                targets: [this.overlay, this.contentNode],
                opacity: 1,
                display: "auto",
                easing: "easeInOutQuad",
                duration: 300,
            })
    }

    hide() {
        if (this.animation) this.animation.pause()
        this.animation = anime({
            targets: [this.overlay, this.contentNode],
            opacity: 0,
            easing: "easeInOutQuad",
            duration: 300,
            complete: () => {
                this.overlay.style.display = this.contentNode.style.display = "none"
            }
        })
    }
}
