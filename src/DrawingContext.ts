import anime from "animejs"
import {singleton} from "tsyringe"

/**
 * Singleton class for drawing context
 */
@singleton()
export class DrawingContext {
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

    draw = () => {}
    readonly init = () => {
        let repaint = () => {
            this.width = window.innerWidth
            this.height = window.innerHeight

            this.canvas.width = this.width
            this.canvas.height = this.height
        }

        window.onresize = repaint
        repaint()

        anime({targets: "", duration: Infinity, update: this.draw})
    }
}
