import anime from "animejs"
import {singleton} from "tsyringe"
import {EventEmitter} from "./common/EventEmitter"
import {clamp} from "./util"

/**
 * Singleton class for drawing context
 */
@singleton()
export class DrawingContext {
    public afterInit: EventEmitter<DrawingContext> = new EventEmitter<DrawingContext>()
    public onRepaint: EventEmitter<DrawingContext> = new EventEmitter<DrawingContext>()

    private readonly _canvas: HTMLCanvasElement | null = null
    private readonly _c: CanvasRenderingContext2D | null = null

    get canvas(): HTMLCanvasElement {
        return this._canvas as HTMLCanvasElement
    }

    get c(): CanvasRenderingContext2D {
        return this._c as CanvasRenderingContext2D
    }

    width: number = 0
    height: number = 0

    constructor() {
        this._canvas = document.getElementById("canvas") as HTMLCanvasElement
        this._c = this.canvas.getContext("2d") as CanvasRenderingContext2D
    }

    get innerRadius(): number {
        return clamp(Math.min(this.width, this.height) * .05, 30, 40)
    }

    get outerRadius(): number {
        return clamp(Math.min(this.width, this.height) * .45, 200, 500)
    }

    draw = () => {}
    readonly init = () => {
        let repaint = () => {
            this.width = window.innerWidth
            this.height = window.innerHeight

            this.canvas.width = this.width
            this.canvas.height = this.height

            this.c.translate(this.width / 2, this.height / 2)
            this.onRepaint.emit(this)
        }

        window.onresize = repaint
        repaint()

        anime({targets: "", duration: Infinity, update: this.draw})

        this.afterInit.emit(this)
    }
}
