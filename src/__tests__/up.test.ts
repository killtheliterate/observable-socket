import EventEmitter from 'events'

// ---------------------------------------------------------------------------

import { create } from '../index'

// ---------------------------------------------------------------------------

const send = (socket: ReturnType<typeof create>, msg: string) => socket.up(msg)
const noop = (..._args: unknown[]) => null

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

    const socket = create(ws as unknown as WebSocket)

    send(socket, 'hello human...').catch(done)
  })

  it('waits to send messages until the socket is ready', function (done) {
    const ws = new WS()

    ws.send = function (msg) {
      expect(msg).toEqual('hello human...')
      done()
    }

    const socket = create(ws as unknown as WebSocket)

    setTimeout(() => ws.emit('open'), 3000)

    send(socket, 'hello human...').catch(done)
  })

  it('handles errors', function (done) {
    const ws = new WS()

    ws.readyState = 1

    ws.send = function () {
      throw new Error('blech')
    }

    const socket = create(ws as unknown as WebSocket)

    send(socket, 'hello human...').catch((err: { message: string }) => {
      expect(err.message).toEqual('blech')
      done()
    })
  })
})
