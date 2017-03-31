var EventEmitter = require('events')
var expect = require('chai').expect

var create = require('../../dist/index')

const sum = (acc, el) => acc + el
const noop = () => null

describe('down', function () {
  it('observes messages', function (done) {
    const ws = new EventEmitter()
    const socket = create(ws)

    socket.down.take(1)
      .subscribe(
        el => expect(el).to.equal(1),
        done,
        noop
      )

    socket.down
      .reduce(sum, 0)
      .subscribe(
        el => expect(el).to.equal(6),
        done,
        () => done()
      )

    ws.emit('message', 1)
    ws.emit('message', 2)
    ws.emit('message', 3)
    ws.emit('close')
  })

  it('completes', function (done) {
    const ws = new EventEmitter()
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
    const ws = new EventEmitter()
    const socket = create(ws)

    socket.down
      .subscribe(
        noop,
        err => {
          expect(err.message).to.equal('you done messed up')
          done()
        }
      )

    ws.emit('error', new Error('you done messed up'))
  })
})
