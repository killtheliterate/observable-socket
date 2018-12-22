import debug from 'debug'
import { EventTargetLike } from 'rxjs/internal/observable/fromEvent'
import { Observable, fromEvent, Observer } from 'rxjs'
import { take } from 'rxjs/operators'

// ---------------------------------------------------------------------------

export interface WebSocketLike {
  readyState: number
  send: (...args: unknown[]) => void
}

export function create (_ws: WebSocketLike & EventTargetLike<WebSocketLike>) {
  const log = debug('observable-socket')
  const ready = () => _ws.readyState === 1
  const send = (message: unknown) => _ws.send(message)

  const readyToSend: Promise<typeof send> = new Promise((resolve) => {
    // If we make an Observable from an already connected socket, we'll never
    // hear anything about 'open'.
    if (ready()) {
      log('already opened')

      resolve(send)
    } else {
      fromEvent(_ws, 'open').pipe(take(1)).subscribe(() => resolve(send))
    }
  })

  // Compose socket event streams, so that external subscribers have a single
  // interface that forwards socket events to onNext, onError and onCompleted.
  const webSocketObservable: Observable<any> = Observable.create(function (observer: Observer<any>) {
    const messageSubscription = fromEvent(_ws, 'message')
      .subscribe(function handleNext (e) {
        debug('observable-socket:handleNext')('message')

        observer.next(e)
      })

    const errorSubscription = fromEvent(_ws, 'error')
      .subscribe(function handleNext (e) {
        log('error', e)

        observer.error(e)
      })

    const closeSubscription = fromEvent(_ws, 'close')
      .subscribe(function handleNext () {
        log('closed')

        observer.complete()
      })

    return function cleanup () {
      closeSubscription.unsubscribe()
      errorSubscription.unsubscribe()
      messageSubscription.unsubscribe()
    }
  })

  return {
    up: (message: unknown) => readyToSend.then(send => send(message)),
    down: webSocketObservable
  }
}
