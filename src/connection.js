import WebSocket from 'ws'
import Rx from 'rx'

const fromEvent = Rx.Observable.fromEvent

export default function observeableSocket (socketAddress) {
    const _ws = new WebSocket(socketAddress)

    const openStream = fromEvent(_ws, 'open')
    const closeStream = fromEvent(_ws,'close')

    const messageStream = openStream
        .flatMap(() => fromEvent(_ws, 'message'))
        .takeUntil(closeStream)

    const address = new Promise(function(resolve) {
        openStream.subscribe(() =>
            resolve(message => _ws.send(JSON.stringify(message)))
        )
    })

    return {
        send: function(message) {
            address.then(proxy => proxy(message))
        },

        signal: messageStream,
    }
}
