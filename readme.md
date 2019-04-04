# Sound Processing
This is a project for [MM2](https://moodle.fel.cvut.cz/course/view.php?id=3896) subject,
aimed at creative exploration of *sound processing* and its *visual representation.*  

### Quick start [development](#todo)
1. Clone repository
1. `npm install`
1. `npm start`

*Note: requires [Sass](https://sass-lang.com/install) to compile css*

### Description
This is a [Typescript](https://www.typescriptlang.org/) web project that uses
[Web Audio Api](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
and [Web MIDI Api](https://webaudio.github.io/web-midi-api/) to work with *sound* 
while creating visual effects on *HTML Canvas* using
[Anime.js](https://animejs.com) 

#### Application view
##### Rings
Small and large, `keyboard ring` and `resolution ring` respectively.
Sound is played at `keyboard ring` travels to `resolution ring` and played again. 

##### Modification field
Area in between is the `modification field` - it can be filled with `modifiers`, that
can change the sound in various ways. `Modifiers` are divided into two categories:
1. [Directional](#directional-modifiers)
1. [Transformational](#transformational-modifiers)



#### Main flow
* Press a key on MIDI (or usual/virtual) keyboard to play a sound  at `keyboaard ring`
and send it travelling to the `resolution circe`.
* Press sustain pedal to achieve the same effect as holding the key.

#### Alternative flows 
* Click anywhere on `modification field` to set up a `modifier` in a closest
    available point.
* Click on existing `modifier` to edit or remove.
* Drag any placed `modifier` to a new place to change its location.
    * Drag onto another `modifier` to swap.
* Click on `modify keyboard` button to modify the keyboard - create a mapping from 
    standard 7 octaves to a custom keyboard. [More](#keyboard-mapping)
* Click on `create pattern` to create a pattern to be repeated automatically.
    [More](#automatic-pattern-playing)  
* Hover on `quantization` to change quantization. [More](#quantization)
* Hover on `sounds` to change the played sound. [More](#changing-the-sound)
* Click `help` to see details about the app. 

### Application features
#### Modifiers
##### Directional modifiers
* Delay
* Router
* Resolver
* Mirror
* Velocity

##### Transformational modifiers
* ##### Flanger [(code)](https://github.com/elumixor/SoundProcessing/blob/master/src/effects/Flanger.ts)
> Flanging is an audio effect produced by mixing two identical 
signals together, one signal delayed by a small and gradually 
changing period - [Wikipedia](https://en.wikipedia.org/wiki/Flanging)

[**Video demonstration**](https://www.youtube.com/watch?v=DNhxzbiDyRk)

Our `Sound`s are essentially represented as a sample buffer.
Thus, simple flanging effect could be done as such:

```typescript
const delaySamples = 25
const mix = 0.5
    
/** Takes sound samples, applies flanging and 
  * returns new sound samples, representing new sound */  
function apply(soundSamples: number[]): number[] {
    const newSamples: number[] = []
    for (let i = 0; i < soundSamples.length; i++) {
        const resultSample = soundSamples[i] * (1 - mix) // original sample
                            + soundSamples[(i + delaySamples) % soundSamples.length] * mix // offset sample
        newSamples.push(resultSample)
    }

    return newSamples
}
```

Normally we would rather specify sample delay as offset by ms:
```typescript
const offsetMs = 15
const SampleRate = 44100

// to transform into sample domain
const offsetSamples = offsetMs / 1000 * SampleRate
```
 
Usually, though, flanging implies varying (oscillating) delay, and 
express its frequency in hertz. To calculate the offset in samples
(i.e. to determine which sample we should add to the original wave)
we use:
```typescript
const SampleRate = 44100
const offsetMs = 15
const oscillationFrequency = 1/2

function getOffset(sample: number): number {
    return offsetMs * Math.cos(sample/SampleRate * oscillationFrequency * 2 * Math.PI)
}
```

When put together, this gives us a `Flanger`
```typescript
class Flanger {
    SampleRate = 44100
    offsetMs = 15
    oscillationFrequency = 1/2
    mix = .5

    getOffset(sample: number): number {
        return Math.cos(sample/this.SampleRate * this.oscillationFrequency * 2 * Math.PI) * this.offsetMs
    }

    apply(soundSamples: number[]): number[] {
        const newSamples: number[] = []
        for (let i = 0; i < soundSamples.length; i++)
            newSamples.push(soundSamples[i] * (1 - this.mix) +
                soundSamples[Math.round(i + this.getOffset(i)) % soundSamples.length] * this.mix)

        return newSamples
    }
}
```
[Flanger.ts](https://github.com/elumixor/SoundProcessing/blob/master/src/effects/Flanger.ts)

* ##### Chorus
* ##### Distortion
* ##### Compressor
* ##### Reverberation

#### Wavetable sound editor
Allows to create custom sound by defining wave
- Define wave form in cycle
- Define pre-delay, attack, (decay - later...), release
- Apply oscillators
- Key mod
- Velocity mod

#### Automatic pattern playing
todo

#### Sound strength
Depends on key hit strength and `velocity modifiers`. Global volume can be changed 
via slider.

#### Quantization
todo

#### Changing the sound
Allows to chose from standard sounds, create a custom sound wave or upload a custom 
sound.
- Choosing from standard sounds
- [Custom sound wave](#wavetable-sound-editor)
- Custom file upload

#### Keyboard mapping
todo

#### Rotation effect
todo description

#### Playing from midi file
todo description implementation

### Todo
- [x] Project idea, setup repository, typescript + webpack
- [x] Basic readme
- [x] Basic application structure
- [x] Application view - rings, mf
- [x] Play from MIDI keyboard
- [x] Play from computer keyboard
- [x] Keyboard mapping
    - [x] Overlay window, icon click handling + animations
    - [x] Digital keyboard keys
    - [x] Piano keyboard dialog window, close, open, switch windows
    - [x] Digital piano, buttons, scrolling
    - [x] Mapping key to piano
    - [ ] Animations
- [ ] Playing patterns
- [x] Travelling sound to the resolution ring
- [x] Basic animations
- [x] Modifiers basics
    - [ ] Editing, removal, changing location and swapping
- [ ] Directional modifiers
    - [ ] Delay
    - [ ] Router
    - [ ] Resolver
    - [ ] Mirror
- [ ] Update readme docs + code docs
- [ ] Transformational modifiers
    - [x] Flanger
    - [ ] Chorus
    - [ ] Distortion
    - [ ] Compressor
    - [ ] Reverberation
- [ ] Parametrize modifiers - detailed parameter window
- [ ] Update readme docs + code docs
- [ ] Quantization
- [ ] Visual effects
- [ ] Custom sound waves
    - [x] Modifying standard sine wave
    - [ ] Envelope
    - [ ] Standard waves
- [ ] Custom sound upload
- [ ] Features
    - [ ] Global volume slider
    - [ ] Help/tutorial
    - [ ] Harmonies
    - [ ] Mappings switching
- [ ] Patterns from midi 
- [ ] Update readme
