var expect = require('chai').expect
var take = require('rxjs/operator/take').take

var createConnection = require('../../../dist/index')

describe('server', function () {
    it('should not be a piece of shit', function (done) {
        var socket = new WebSocket('ws://localhost:8086')

        socket.onmessage = function onMessage (e) {
            if (e.data === 'Echo: done') {
                expect(true).to.equal(true)

                done()
            }
        }

        setTimeout(function () {
            socket.send('test')
            socket.send('test')
            socket.send('done')
        }, 1000)
    })
})

describe('next', function () {
    describe('open socket', function () {
        it('sends immediately if socket is already open', function (done) {
            this.timeout(3000)

            var socket = new WebSocket('ws://localhost:8086')

            setTimeout(function () {
                const stream = createConnection(socket)

                stream.next('old socket')

                var sub = take.call(stream, 1)

                sub.subscribe(function (el) {
                    expect(el).to.equal('Echo: old socket')

                    done()
                })
            }, 100)
        })
    })

    describe('new socket', function () {
        it('waits to send until socket is open', function (done) {
            var stream = createConnection(new WebSocket('ws://localhost:8086'))

            stream.next('new socket')

            var sub = take.call(stream, 1)

            sub.subscribe(function (el) {
                expect(el).to.equal('Echo: new socket')

                done()
            })
        })
    })

})
