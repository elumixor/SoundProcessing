import {singleton} from "tsyringe"
import {KeyboardRing} from "./rings/KeyboardRing"
import {ModificationField} from "./modificationField/ModificationField"
import {ResolutionRing} from "./rings/ResolutionRing"
import {Renderable} from "../common/Renderable"
import anime, {AnimeInstance} from "animejs"
import {DrawingContext} from "../DrawingContext"
import {Input} from "../input/Input"
import {Point} from "../common/Point"
import {Settings} from "../Settings"
import {clamp} from "../util"
import {Segment} from "./modificationField/Segment"
import {UI} from "../ui/UI"

@singleton()
export class Scene implements Renderable {
    private mouseLocation = new Point()
    private center = new Point()
    private anim: AnimeInstance

    constructor(private dc: DrawingContext,
                private keyRing: KeyboardRing,
                private resRing: ResolutionRing,
                private modField: ModificationField,
                private settings: Settings,
                private ui: UI) {
        dc.afterInit.subscribe(() => {
            this.center = new Point(dc.width / 2, dc.height / 2)
        })

        dc.c.canvas.addEventListener("mousemove", e => {
            this.mouseLocation = new Point(e.x, e.y)

            let dist = this.mouseLocation.distanceTo(this.center)
            if (dist <= dc.outerRadius && dist >= dc.innerRadius) {
                if (this.inField === false) this.onFieldEnter()
                this.inField = true
            } else {
                if (this.inField === true) this.onFieldLeave()
                this.inField = false
            }

            if (this.inField) this.onFieldMove()
        })
        dc.c.canvas.addEventListener("click", e => {
            if (this.inField) {
                //this.hovered.
                this.ui.showPopup(this.ui.popups.effects)

                if (this.hovered) this.ui.popups.effects.chooseFor(this.hovered)
            }
        })

        // Rotate canvas
        this.anim = anime({
            targets: null, duration: Infinity, update: () => {
                this.rotated += .005
                dc.c.rotate(.005)
                if (this.inField) this.onFieldMove()
            },
            easing: "easeInCubic"
        })

    }

    private rotated = 0
    private inField = false

    private onFieldLeave() {
        if (this.hovered) {
            this.hovered.hovered = false
            this.hovered = undefined
        }
        this.anim.restart()
    }

    private onFieldEnter() {
        this.anim.pause()
        let rotated = this.rotated

        anime({
            targets: this, rotated: 0, duration: 300, update: a => {
                this.dc.c.rotate(this.rotated - rotated)
                rotated = this.rotated
            }
        })
    }

    private hovered: Segment | undefined = undefined

    private onFieldMove() {
        const d = this.mouseLocation.distanceTo(this.center)
        const dist = Math.floor((d - this.dc.innerRadius) / (this.dc.outerRadius - this.dc.innerRadius) *
            this.settings.maxTravelDistance)
        const dv = this.mouseLocation.sub(this.center)
        const ang = Math.atan2(-dv.y, -dv.x) - this.rotated + Math.PI / this.settings.keyCount + Math.PI
        const circles = Math.floor(ang / Math.PI / 2)
        const sector = Math.floor((ang - 2 * Math.PI * circles) / (Math.PI * 2) * this.settings.keyCount)

        if (dist >= 0) {
            const segment = this.modField.getSegment(dist, sector)
            if (segment) {
                if (this.hovered) this.hovered.hovered = false
                segment.hovered = true
                this.hovered = segment
            }
        }
    }

    render(): void {
        this.modField.render()
        this.keyRing.render()
        this.resRing.render()
    }
}
