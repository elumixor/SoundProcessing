import "reflect-metadata"
import {container} from "tsyringe"
import {DrawingContext} from "./DrawingContext"
import {Scene} from "./scene/Scene"
import {SoundManager} from "./Sounds"
import {UI} from "./ui/UI"

const dc = container.resolve(DrawingContext)
const ui = container.resolve(UI)
const scene = container.resolve(Scene)
container.resolve(SoundManager)

let bounds: { x1: number, y1: number, x2: number, y2: number }

dc.onRepaint.subscribe(dc => {
    bounds = {
        x1: dc.width / 2,
        y1: dc.height / 2,
        x2: -dc.width,
        y2: -dc.height
    }
})
dc.draw = () => {
    dc.c.clearRect(bounds.x1, bounds.y1, bounds.x2, bounds.y2)
    scene.render()
}

dc.init()
