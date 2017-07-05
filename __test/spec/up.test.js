const EventEmitter = require('events')
const expect = require('chai').expect

const create = require('../../dist/cjs')

const send = (socket, msg) => socket.up(msg)

describe('up', function () {
  it('sends messages', function (done) {
    const ws = new EventEmitter()

    ws.readyState = 1

    ws.send = function (msg) {
      expect(msg).to.equal('hello human...')
      done()
    }

    const socket = create(ws)

    send(socket, 'hello human...')
  })

  it('waits to send messages until the socket is ready', function (done) {
    const ws = new EventEmitter()

    ws.send = function (msg) {
      expect(msg).to.equal('hello human...')
      done()
    }

    const socket = create(ws)

    send(socket, 'hello human...')

    setTimeout(() => ws.emit('open'), 50)
  })

  it('handles errors', function (done) {
    const ws = new EventEmitter()

    ws.readyState = 1

    ws.send = function () {
      throw new Error('blech')
    }

    const socket = create(ws)

    send(socket, 'hello human...').catch(err => {
      expect(err.message).to.equal('blech')
      done()
    })
  })
})
