export class EventEmitter<T = void> {
    private recipients: ((arg: T) => any)[] = []

    emit(data: T): void {
        this.recipients.forEach(s => s(data))
    }

    subscribe(f: (arg: T) => any): void {
        this.recipients.push(f)
    }

    unsubscribe(): void {
        this.recipients = []
    }
}
