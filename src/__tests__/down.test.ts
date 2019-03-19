import EventEmitter from 'events'

import {
  reduce,
  take
} from 'rxjs/operators'

// ---------------------------------------------------------------------------

import { create } from '../index'

// ---------------------------------------------------------------------------

const sum = (acc: number, el: unknown) => {
  if (typeof el === 'number') {
    return acc + el
  } else {
    return acc
  }
}

const noop = () => null

class WS extends EventEmitter {
  readyState = 1
  send = () => undefined
}

describe('down', function () {
  it('observes messages', function (done) {
    const ws = new WS()
    const socket = create(ws)

    socket.down.pipe(take(1))
      .subscribe(
        (el) => expect(el).toEqual(1),
        done,
        noop
      )

    socket.down.pipe(reduce(sum, 0))
      .subscribe(
        (el) => expect(el).toEqual(6),
        done,
        () => done()
      )

    ws.emit('message', 1)
    ws.emit('message', 2)
    ws.emit('message', 3)
    ws.emit('close')
  })

  it('completes', function (done) {
    const ws = new WS()
    const socket = create(ws)

    socket.down
      .subscribe(
        noop,
        done,
        () => done()
      )

    ws.emit('close')
  })

  it('wraps errors', function (done) {
    const ws = new WS()
    const socket = create(ws)

    socket.down
      .subscribe(
        noop,
        (err: { message: string }) => {
          expect(err.message).toEqual('you done messed up')
          done()
        }
      )

    ws.emit('error', new Error('you done messed up'))
  })
})
