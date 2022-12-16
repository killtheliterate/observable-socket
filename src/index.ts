import debug from 'debug'
import wS from 'ws'
import { take } from 'rxjs/operators'

import {
  Observable,
  fromEvent
} from 'rxjs'

// ---------------------------------------------------------------------------

type MessageType =
  | ArrayBufferLike
  | ArrayBufferView
  | Blob
  | string

type _WebSocket =
  | WebSocket
  | wS

export function create (_ws: _WebSocket) {
  const log = debug('observable-socket')
  const ready = () => _ws.readyState === 1
  const send = (message: MessageType) => _ws.send(message)

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
  const webSocketObservable = new Observable<MessageEvent>(function (observer) {
    const messageSubscription = fromEvent<MessageEvent>(_ws, 'message')
      .subscribe(function handleNext (e) {
        debug('observable-socket:handleNext')('message')

        observer.next(e)
      })

    const errorSubscription = fromEvent<ErrorEvent>(_ws, 'error')
      .subscribe(function handleNext (e) {
        log('error', e)

        observer.error(e)
      })

    const closeSubscription = fromEvent<CloseEvent>(_ws, 'close')
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
    up: async (message: MessageType) => {
      const send = await readyToSend

      return send(message)
    },
    down: webSocketObservable
  }
}
