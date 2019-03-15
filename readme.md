# Sound Processing
This is a project for [MM2](https://moodle.fel.cvut.cz/course/view.php?id=3896) subject,
aimed at creative exploration of *sound processing* and its *visual representation.*  

### Quick start [development](#todo)
1. Clone repository
1. `npm install`
1. `npm start`

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
* Flanger
* Chorus
* Distortion
* Compressor
* Reverberation

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
- Custom sound wave
- Custom file upload

#### Keyboard mapping
todo

#### Rotation effect
todo

### Todo
- [x] Project idea, setup repository, typescript + webpack
- [x] Basic readme
- [ ] Basic application structure 
- [ ] Application view
- [x] Play from MIDI keyboard
- [ ] Play from computer keyboard
- [ ] Keyboard mapping
- [ ] Playing patterns
- [ ] Travelling sound to the resolution ring
- [ ] Basic animations
- [ ] Modifiers basics, editing, removal, changing location and swapping
- [ ] Directional modifiers
    - [ ] Delay
    - [ ] Router
    - [ ] Resolver
    - [ ] Mirror
- [ ] Update readme docs
- [ ] Transformational modifiers
    - [ ] Flanger
    - [ ] Chorus
    - [ ] Distortion
    - [ ] Compressor
    - [ ] Reverberation
- [ ] Update readme docs
- [ ] Quantization
- [ ] Visual effects
- [ ] Custom sound waves
    - [ ] Standard waves
- [ ] Custom sound upload
- [ ] Global app features:
    - [ ] Global volume slider
    - [ ] Help/tutorial
- [ ] Update readme
