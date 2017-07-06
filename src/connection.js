import debug from 'debug'
import Observable from './observable-all'

export default function observableSocket (_ws) {
  const log = debug('observable-socket')
  const ready = () => _ws.readyState === 1
  const send = message => _ws.send(message)

  const readyToSend = new Promise(function readyToSend (resolve) {
    // If we make an Observable from an already connected socket, we'll never
    // hear anything about 'open'.
    if (ready()) {
      log('already opened')

      resolve(send)
    } else {
      Observable.fromEvent(_ws, 'open')
        .take(1)
        .subscribe(() => resolve(send))
    }
  })

  // Compose socket event streams, so that external subscribers have a single
  // interface that forwards socket events to onNext, onError and onCompleted.
  const webSocketObservable = Observable.create(function (observer) {
    const messageSubscription = Observable.fromEvent(_ws, 'message')
      .subscribe(function handleNext (e) {
        debug('observable-socket:handleNext')('message')

        observer.next(e)
      })

    const errorSubscription = Observable.fromEvent(_ws, 'error')
      .subscribe(function handleNext (e) {
        log('error', e)

        observer.error(e)
      })

    const closeSubscription = Observable.fromEvent(_ws, 'close')
      .subscribe(function handleNext (e) {
        log('closed')

        observer.complete(e)
      })

    return function cleanup () {
      closeSubscription.unsubscribe()
      errorSubscription.unsubscribe()
      messageSubscription.unsubscribe()
    }
  })

  return {
    up: message => readyToSend.then(send => send(message)),
    down: webSocketObservable
  }
}
