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

    const publisher = new Promise(function(resolve) {
        openStream.subscribe(() =>
            resolve(message => _ws.send(JSON.stringify(message)))
        )
    })

    return {
        address: function(message) {
            publisher.then(send => send(message))
        },

        signal: parseStream,
    }
}
