var EventEmitter = require('events')
var expect = require('chai').expect
var reduce = require('rxjs/operator/reduce').reduce
var take = require('rxjs/operator/take').take

var create = require('../../dist/cjs/bind')

const sum = (acc, el) => acc + el
const noop = () => null

describe('bind', function () {
  it('can add operators', function (done) {
    const ws = new EventEmitter()
    const socket = create(ws)

    take.call(socket.down, 1)
            .subscribe(
                el => expect(el).to.equal(1),
                done,
                noop
            )

    reduce.call(socket.down, sum, 0)
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
})
