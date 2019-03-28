import {Renderable} from "../../common/Renderable"
import {DrawingContext} from "../../DrawingContext"
import {container} from "tsyringe"
import anime from "animejs"
import {Settings} from "../../Settings"
import {Effect} from "../../effects/Effect"

export class Segment implements Renderable {
    private static dc: DrawingContext = container.resolve(DrawingContext)
    private static settings: Settings = container.resolve(Settings)
    public effect: Effect | null = null

    constructor(public inDist: number, public outDist: number, private a1: number, private a2: number) {}

    private activated = false
    public hovered = false

    private gradient = {
        r1: 0,
        r2: this.outDist,
        opacity: 0,

        get: () => {
            const grd = Segment.dc.c.createRadialGradient(0, 0, this.gradient.r1, 0, 0, this.gradient.r2)
            grd.addColorStop(0, "transparent")
            grd.addColorStop(1, "rgba(0,0,0," + this.gradient.opacity + ")")
            return grd
        }
    }

    private animation: anime.AnimeInstance | null = null
    private timeout: number | null = null
    private animate = () => {
        return anime({
            targets: this.gradient,
            r1: this.outDist,
            opacity: 1,
            duration: Segment.settings.travelTime * .9,
            easing: "linear"
        })
    }

    activate(): void {
        if (this.activated) {
            clearTimeout(this.timeout || 0)
            this.animation!.pause()
            this.gradient.r1 = 0
            this.animation = this.animate()
        } else {
            this.activated = true
            this.gradient.opacity = 0
            this.gradient.r1 = 0
            this.animation = this.animate()
        }

        this.timeout = setTimeout(() => {
            this.deactivate()
        }, Segment.settings.travelTime * .9)
    }

    deactivate(): void {
        this.activated = false
    }

    private static fillWith(color: string): void {
        const fc = Segment.dc.c.fillStyle
        Segment.dc.c.fillStyle = color
        Segment.dc.c.fill()
        Segment.dc.c.fillStyle = fc
    }

    render() {
        Segment.dc.c.beginPath()
        Segment.dc.c.arc(0, 0, this.inDist, this.a1, this.a2)
        Segment.dc.c.arc(0, 0, this.outDist, this.a2, this.a1, true)

        if (this.hovered) Segment.fillWith("green")
        else if (this.effect) Segment.fillWith(this.effect.segmentColor)
        else Segment.dc.c.fill()

        Segment.dc.c.closePath()

        if (this.activated) {
            const fs = Segment.dc.c.fillStyle
            Segment.dc.c.fillStyle = this.gradient.get()

            Segment.dc.c.beginPath()
            Segment.dc.c.arc(0, 0, this.inDist, this.a1, this.a2)
            Segment.dc.c.arc(0, 0, this.outDist, this.a2, this.a1, true)
            Segment.dc.c.fill()
            Segment.dc.c.closePath()

            Segment.dc.c.fillStyle = fs
        }
    }

    setEffect(effect: Effect) {
        this.effect = effect
        console.log(this.effect);
    }
}
