import "reflect-metadata"
import {container} from "tsyringe"
import {DrawingContext} from "./DrawingContext"
import {Scene} from "./scene/Scene"
import {SoundManager} from "./Sounds"
import {average, chunk} from "./util"

const dc = container.resolve(DrawingContext)

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

//
//const oReq = new XMLHttpRequest()
//oReq.open("GET", "/assets/sounds/pad_stars.wav", true)
//oReq.responseType = "arraybuffer"
//
//if (false) {
//    oReq.onload = () => {
//        const arrayBuffer = oReq.response  // Note: not oReq.responseText
//        if (arrayBuffer) {
//            new Audio(arrayBuffer)
//            const source = Audio.ctx.createBufferSource()
//            Audio.ctx.decodeAudioData(arrayBuffer, buffer => {
//                source.buffer = buffer
//                console.log(buffer)
//                source.connect(Audio.ctx.destination)
//                console.log(source)
//                const c1 = source!.buffer!.getChannelData(0) // channel 0 data
//                const c2 = source!.buffer!.getChannelData(1) // channel 1 data
//
//                function compress(channel: Float32Array) {
//                    const w = innerWidth / channel.length // how much width would one sample take
//                    //let chunkSize = 1 / w * 20
//                    let chunkSize = channel.length / 10
//                    console.log(chunkSize)
//                    const chunks = chunk<number>(channel, chunkSize).map(c => average(c)) // split into chunks
//
//                    //const centerH = innerHeight / 2
//                    //ctx.fillStyle = "black"
//                    //c1.forEach((el, i) => {
//                    //    ctx.fillRect(i * w, centerH, w, 50)
//                    //})
//
//                    for (let i = 0; i < channel.length; i += chunkSize) {
//                        for (let j = i; j < i + chunkSize; j++) {
//                            channel[j] = chunks[i]
//                        }
//                    }
//                }
//
//                compress(c1)
//                compress(c2)
//
//                //for (let i = 0; i<c1.length; i++)
//                //    c1[i
//                //    ] = c1[i] * 10
//
//                //console.log("max 2");
//                //for (let i = 0; i < c1.length; i++) {
//                //    if (c1[i] > max) max = c1[i]
//                //    if (c1[i] < min) min = c1[i]
//                //}
//                //console.log(max, min)
//
//                //c1 = new Float32Array(norm)
//
//                source.start(0) // will play the sound
//            })
//        }
//
//    }
//}
//
//const channels = 1
//const duration = 2.0
//let sampleRate = Audio.ctx.sampleRate
//const frameCount = sampleRate * duration
//console.log(sampleRate)
//const audioBuffer = Audio.ctx.createBuffer(channels, frameCount, sampleRate)
//
//const Afrequency = Audio.frequency(69)
//const Cfrequency = Audio.frequency(72)
//const Efrequency = Audio.frequency(76)
//
//const c1 = audioBuffer.getChannelData(0)
//for (let i = 0; i < c1.length; i++) {
//    //c1[i] = (Math.sin(i / 32) + Math.sin(i / 137) + Math.sin(i / 13) + Math.sin(i / 7)) / 10
//    //c1[i] = Math.sin(i / Audio.ctx.sampleRate * 2 * Math.PI * 440) // 440 for A
//    //c1[i] = Math.max(0, Math.sin(i / Audio.ctx.sampleRate * 2 * Math.PI * 440)) // no negative values produce sort of
//    // squary sound c1[i] = Math.min(0, Math.sin(i / Audio.ctx.sampleRate * 2 * Math.PI * 440)) // no negative values
//    // produce sort of squary sound c1[i] = Math.sin(i / sampleRate * 2 * Math.PI * 440) * (sampleRate * duration- i) /
//    // (sampleRate * duration) // fading sound
//    const a = Math.sin(i / sampleRate * 2 * Math.PI * Afrequency) * Math.pow((sampleRate * duration - i) / (sampleRate * duration), 1 / 2) // impulse
//    const c = Math.sin(i / sampleRate * 2 * Math.PI * Cfrequency) * Math.pow((sampleRate * duration - i) / (sampleRate * duration), 1 / 2) // impulse
//    const e = Math.sin(i / sampleRate * 2 * Math.PI * Efrequency) * Math.pow((sampleRate * duration - i) / (sampleRate * duration), 1 / 2) // impulse
//
//    c1[i] = (a + c + e) / 3
//}
//
//const source = Audio.ctx.createBufferSource()
//source.buffer = audioBuffer
////source.loop = true
//source.connect(Audio.ctx.destination)
////source.start()
//
//
//oReq.send(null)
