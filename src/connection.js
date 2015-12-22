import { Observable } from 'rx'
import { EventEmitter } from 'events'
import debug from 'debug'

const fromEvent = Observable.fromEvent
const log = debug('observable-socket')

export default function observableSocket (_ws) {
    const _vent = new EventEmitter()
    const openStream = fromEvent(_ws, 'open')

    const address = new Promise(function(resolve) {
        const stream = openStream.subscribe(function() {
            log('opened')

            resolve(message => _ws.send(JSON.stringify(message)))
        })

        _vent.on('dispose', function () {
            log('disposed')

            stream.dispose()
        })
    })

    // Compose socket event streams, so that external subscribers have
    // a single interface that follows the typical observer signature.
    const socketStream = Observable.create(function(observer) {
        const messageStream = openStream.flatMap(() => fromEvent(_ws, 'message'))

        const closeDisposable = fromEvent(_ws,'close').subscribe(function (e) {
            log('closed')

            observer.onCompleted(e)
        })

        const errorDisposable = fromEvent(_ws, 'error').subscribe(function (e) {
            log('error', e)

            observer.onError(e)
        })

        const messageDisposable = messageStream.subscribe(e => observer.onNext(e))

        return function () {
            closeDisposable.dispose()
            errorDisposable.dispose()
            messageDisposable.dispose()

            _vent.emit('dispose') // destroy send stream
        }
    })

    return {
        send: function(message) {
            return address.then(proxy => proxy(message))
        },

        observable: socketStream,
    }
}
