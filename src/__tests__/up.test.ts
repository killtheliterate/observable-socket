import EventEmitter from 'events'

// ---------------------------------------------------------------------------

import { create } from '../index'

// ---------------------------------------------------------------------------

const send = (socket: any, msg: string) => socket.up(msg)
const noop = (..._args: any[]) => undefined

class WS extends EventEmitter {
  readyState = 1
  send = (msg: unknown) => { noop(msg) }
}

describe('up', function () {
  it('sends messages', function (done) {
    const ws = new WS()

    ws.readyState = 1

    ws.send = function (msg) {
      expect(msg).toEqual('hello human...')
      done()
    }

    const socket = create(ws)

    send(socket, 'hello human...')
  })

  it('waits to send messages until the socket is ready', function (done) {
    const ws = new WS()

    ws.send = function (msg) {
      expect(msg).toEqual('hello human...')
      done()
    }

    const socket = create(ws)

    send(socket, 'hello human...')

    setTimeout(() => ws.emit('open'), 50)
  })

  it('handles errors', function (done) {
    const ws = new WS()

    ws.readyState = 1

    ws.send = function () {
      throw new Error('blech')
    }

    const socket = create(ws)

    send(socket, 'hello human...').catch((err: { message: string }) => {
      expect(err.message).toEqual('blech')
      done()
    })
  })
})
