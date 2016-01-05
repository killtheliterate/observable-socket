var expect = require('chai').expect

var createConnection = require('../../../dist/index')

describe('socket.send', function () {

    describe('open socket', function () {
        it('sends immediately if socket is already open', function (done) {
            this.timeout(3000)

            var socket = new WebSocket('ws://echo.websocket.org')

            setTimeout(function () {
                const stream = createConnection(socket)

                stream.send('old socket')

                var sub = stream.observable.take(1)

                sub.subscribe(function (el) {
                    expect(el).to.equal('old socket')

                    done()
                })
            }, 100)
        })
    })

    describe('new socket', function () {
        it('waits to send until socket is open', function (done) {
            var stream = createConnection(new WebSocket('ws://echo.websocket.org'))

            stream.send('new socket')

            var sub = stream.observable.take(1)

            sub.subscribe(function (el) {
                expect(el).to.equal('new socket')

                done()
            })

        })
    })

})
