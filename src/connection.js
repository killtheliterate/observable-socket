import Rx from 'rx'
import {EventEmitter} from 'events'

const fromEvent = Rx.Observable.fromEvent

export default function observableSocket (_ws) {
    const _vent = new EventEmitter()

    const _openStream = fromEvent(_ws, 'open')

    const address = new Promise(function(resolve) {
        const stream = _openStream.subscribe(() =>
            resolve(message => _ws.send(JSON.stringify(message)))
        )

        _vent.on('dispose', () => stream.dispose())
    })

    // Compose socket event streams, so that external subscribers have
    // a single interface that follows the typical observer signature.
    const socketStream = Rx.Observable.create(function(observer) {
        const _messageStream = _openStream.flatMap(() => fromEvent(_ws, 'message'))

        const closeDisposable = fromEvent(_ws,'close').subscribe(e => observer.onCompleted(e))
        const errorDisposable = fromEvent(_ws, 'error').subscribe(e => observer.onError(e))
        const messageDisposable = _messageStream.subscribe(e => observer.onNext(e))

        return function () {
            closeDisposable.dispose()
            errorDisposable.dispose()
            messageDisposable.dispose()

            _ws.close() // dispose of the websocket

            _vent.emit('dispose') // destroy send stream
        }
    })

    return {
        send: function(message) {
            address.then(proxy => proxy(message))
        },

        observable: socketStream,
    }
}
