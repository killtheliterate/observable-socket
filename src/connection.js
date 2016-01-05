import { Observable } from 'rx'
import { EventEmitter } from 'events'
import { isFunction } from 'lodash'
import debug from 'debug'

const log = debug('observable-socket')

export default function observableSocket (_ws) {
    let ws, browser = false // init

    // @TODO: eat spaghetti
    //
    // This is obviously brittle. As written, this only works with
    // window.WebSocket or ws. Both have different APIs for working with
    // socket events. This is intended to normalize the relevant ones.
    if (isFunction(global.WebSocket)) {
        ws = new EventEmitter()
        browser = true

        _ws.onopen    = () => ws.emit('open')
        _ws.onclose   = () => ws.emit('close')
        _ws.onerror   = () => ws.emit('error')

        _ws.onmessage = e => ws.emit('message', e.data)
    } else {
        ws = _ws
    }

    const readyToSend = new Promise(function (resolve) {

        // window.WebSocket gets weird when trying to proxy to it... so this
        // "browser" boolean madness seems to be necessary at the moment.
        const ready = () => browser
            ? _ws.readyState === 1
            : ws.readyState === 1

        const send = message => browser
            ? _ws.send(message)
            : ws.send(message)

        // If we make an Observable from an already connected socket, we'll
        // never hear anything about 'open'.
        if (ready()) {
            log('already opened')

            resolve(send)
        } else {
            ws.once('open', function () {
                log('opened')

                resolve(send)
            })
        }
    })

    // Compose socket event streams, so that external subscribers have
    // a single interface that forwards socket events to onNext, onError and
    // onCompleted.
    const socketStream = Observable.create(function (observer) {
        const messageDisposable = Observable.fromEvent(ws, 'message')
            .subscribe(function onNext (e) {
                debug('observable-socket:onNext')('message')

                observer.onNext(e)
            })

        const errorDisposable = Observable.fromEvent(ws, 'error')
            .subscribe(function onNext(e) {
                log('error', e)

                observer.onError(e)
            })

        const closeDisposable = Observable.fromEvent(ws,'close')
            .subscribe(function onNext (e) {
                log('closed')

                observer.onCompleted(e)
            })

        return function disposeAndEmit () {
            closeDisposable.dispose()
            errorDisposable.dispose()
            messageDisposable.dispose()
        }
    })

    return {
        send: message => readyToSend.then(send => send(message)),
        observable: socketStream,
    }
}
