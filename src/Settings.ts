import {singleton} from "tsyringe"

@singleton()
export class Settings {
    keys: number = 32
}
