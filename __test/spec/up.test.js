var EventEmitter = require('events')
var expect = require('chai').expect

var create = require('../../dist/index')

const send = (socket, msg) => socket.next(msg)

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

  it('swallows errors (bummer...)', function (done) {
    const ws = new EventEmitter()

    process.once('unhandledRejection', function (err) {
      expect(err.message).to.equal('blech')
      done()
    })

    ws.readyState = 1

    ws.send = function () {
      throw new Error('blech')
    }

    const socket = create(ws)

    send(socket, 'hello human...')
  })
})
