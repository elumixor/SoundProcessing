import {Component} from "../Component"
import {createElement} from "../dom"
import anime from "animejs"

export class Popup extends Component {
    private readonly contentNode = createElement("div", ["popup-content"])
    private animation: anime.AnimeInstance | null = null


    constructor(templateUrl: string, afterParsed: () => any = () => {}) {
        super(templateUrl, () => {
            this.content!.childNodes.forEach(n => this.contentNode!.appendChild(n))
            afterParsed()
        })
        this.contentNode.style.display = "none"
        this.hide()
    }

    show() {
        this.contentNode.style.display = "inline-block"

        if (this.animation) this.animation.pause()
        this.animation = anime(
            {
                targets: this.contentNode,
                opacity: 1,
                display: "auto",
                easing: "easeInOutQuad",
                duration: 300,
            })
    }

    hide() {
        if (this.animation) this.animation.pause()
        this.animation = anime({
            targets: this.contentNode,
            opacity: 0,
            easing: "easeInOutQuad",
            duration: 300,
            complete: () => {
                this.contentNode.style.display = "none"
            }
        })
    }
}
