import WebSocket from 'ws'
import Rx from 'rx'
import {EventEmitter} from 'events'

const fromEvent = Rx.Observable.fromEvent

export default function observeableSocket (socketAddress) {
    const _vent = new EventEmitter()
    const _ws = new WebSocket(socketAddress)

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

        const closeSub = fromEvent(_ws,'close').subscribe(e => observer.onCompleted(e))
        const errorSub = fromEvent(_ws, 'error').subscribe(e => observer.onError(e))
        const messageSub = _messageStream.subscribe(e => observer.onNext(e))

        return function () {
            closeSub.dispose()
            errorSubdispose()
            messageSub.dispose()

            _vent.emit('dispose') // destroy send stream
        }
    })

    return {
        send: function(message) {
            address.then(proxy => proxy(message))
        },

        signal: socketStream,
    }
}
