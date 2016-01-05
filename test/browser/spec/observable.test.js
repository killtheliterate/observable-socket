var _ = require('lodash')
var expect = require('chai').expect

var createConnection = require('../../../dist/index')

describe('socket.observable', function () {

    describe('subscribe', function () {

        describe('onNext', function () {

            beforeEach('connect', function (done) {
                this.consumer = new WebSocket('ws://echo.websocket.org')

                this.stream = createConnection(this.consumer)

                this.stream.send('OPEN')
                this.stream.send('1')
                this.stream.send('2')

                done()
            })

            afterEach('disconnect', function (done) {
                this.stream = null

                done()
            })

            it('receives a message', function (done) {
                var sub = this.stream.observable.take(1)

                sub.subscribe(function (el) {
                    expect(el).to.equal('OPEN')

                    done()
                })
            })

            it('receives a stream of messages', function (done) {
                var sub = this.stream.observable
                    .take(3).toArray()

                sub.subscribe(function (message) {
                    var expected = ['OPEN', '1', '2']

                    expect(_.isEqual(message, expected)).to.equal(true)

                    done()
                })
            })
        })

        describe('onError', function () {
            xit('forwards socket errors to onError', function (done) {
                var consumer = new WebSocket('ws://echo.websocket.org')
                var stream = createConnection(consumer)

                stream.observable.subscribe(
                    function onNext () {
                    },

                    function onError (err) {
                        done(err)
                    },

                    function onCompleted () {
                    }
                )
            })

        })

        describe('onCompleted', function () {

            it('forwards socket close to onCompleted', function (done) {
                var consumer = new WebSocket('ws://echo.websocket.org')
                var stream = createConnection(consumer)

                stream.observable.subscribe(
                    function onNext () {
                    },

                    function onError () {
                    },

                    function onCompleted () {
                        done()
                    }
                )

                setTimeout(() => consumer.close(), 1000)
            })

        })

    })
})
