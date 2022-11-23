type ListenerArgs = any[]
type Listener = (...args: ListenerArgs) => unknown

export class EventEmitter {
  events: Record<string, Listener[]>

  constructor() {
    this.events = {}
  }

  on(event: string, listener: Listener) {
    if (!Array.isArray(this.events[event])) {
      this.events[event] = []
    }

    this.events[event].push(listener)
  }

  off(event: string, listener: Listener) {
    this.events[event]?.filter(l => l !== listener)
  }

  emit(event: string, ...args: ListenerArgs) {
    this.events[event]?.forEach(l => l(...args))
  }
}
