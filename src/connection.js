import WebSocket from 'ws'
import Rx from 'rx'

const fromEvent = Rx.Observable.fromEvent

export default function observeableSocket (address) {
    const _ws = new WebSocket(address)

    const openStream = fromEvent(_ws, 'open')
    const closeStream = fromEvent(_ws,'close')

    const messageStream = openStream
        .flatMap(() => fromEvent(ws, 'message'))
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

        signal: parseStream,
    }
}
