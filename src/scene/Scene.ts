import {singleton} from "tsyringe"
import {KeyboardRing} from "./rings/KeyboardRing"
import {ModificationField} from "./modificationField/ModificationField"
import {ResolutionRing} from "./rings/ResolutionRing"
import {Renderable} from "../common/Renderable"
import anime from "animejs"
import {DrawingContext} from "../DrawingContext"
import {Input} from "../input/Input"

@singleton()
export class Scene implements Renderable {
    constructor(private dc: DrawingContext,
                private keyRing: KeyboardRing,
                private resRing: ResolutionRing,
                private modField: ModificationField) {


        // Rotate canvas
        anime({
            targets: null, duration: Infinity, update: anim => {
                dc.c.rotate(.005)
            }
        })

    }

    render(): void {
        this.modField.render()
        this.keyRing.render()
        this.resRing.render()
    }
}
