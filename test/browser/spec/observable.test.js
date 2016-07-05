var _ = require('lodash')
var expect = require('chai').expect
var take = require('rxjs/operator/take').take

var createConnection = require('../../../dist/index')

describe('subscribe', function () {

    describe('next', function () {
        beforeEach('connect', function (done) {
            this.consumer = new WebSocket('ws://localhost:8087')

            this.stream = createConnection(this.consumer)

            done()
        })

        afterEach('disconnect', function (done) {
            this.stream = null

            done()
        })

        it('receives a message', function (done) {
            var sub = take.call(this.stream, 1)

            sub.subscribe(function (el) {
                expect(el).to.equal('OPEN')

                done()
            })
        })

        it('receives a stream of messages', function (done) {
            var sub = take.call(this.stream, 3).toArray()

            sub.subscribe(function (message) {
                var expected = ['OPEN', '1', '2']

                expect(_.isEqual(message, expected)).to.equal(true)

                done()
            })
        })
    })

    describe.skip('error', function () {
        it('forwards socket errors to onError', function (done) {
            var consumer = new WebSocket('ws://localhost:8088')
            var stream = createConnection(consumer)

            stream.subscribe(
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

    describe('complete', function () {
        it('forwards socket close to onCompleted', function (done) {
            var consumer = new WebSocket('ws://localhost:8087')
            var stream = createConnection(consumer)

            stream.subscribe(
                function onNext () {
                },

                function onError () {
                },

                function onCompleted () {
                    done()
                }
            )

            setTimeout(function () {
                consumer.close()
            }, 1000)
        })
    })

})
