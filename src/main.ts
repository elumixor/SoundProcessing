import "reflect-metadata"
import {container} from "tsyringe"
import {KeyboardRing} from "./keyboardRing"
import {DrawingContext} from "./drawingContext"

window.onload = () => {
    const dc = container.resolve(DrawingContext)
    const c = dc.c

    const keyboardRing = container.resolve(KeyboardRing)

    dc.draw = () => {
        c.clearRect(0 ,0, dc.width, dc.height)
        keyboardRing.render()
    }

    dc.init()
}

