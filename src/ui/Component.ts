import {EventEmitter} from "../common/EventEmitter"

export class Component {
    protected _content: Node | null = null

    get content(): Node | null { return this._content }

    get loaded() { return this._content != null }

    readonly initialized = new EventEmitter<Component>()

    constructor(templateUrl: string, afterParsed: () => any = () => {}) {
        const request = new XMLHttpRequest()
        request.addEventListener("load", (e) => {
            this._content = request.responseXML!.body as Node
            afterParsed()
            this.initialized.emit(this)
        })
        request.open("GET", templateUrl)
        request.responseType = "document"
        request.send()
    }
}
