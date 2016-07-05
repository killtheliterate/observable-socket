import Websocket from 'ws'
import _ from 'lodash'
import { expect } from 'chai'

import createConnection from '../../../dist/index'
import { Publish, Err } from '../../server'

// Observable operators
import { take } from 'rxjs/operator/take'

describe('socket.subscribe', function () {

    describe('next', function () {

        beforeEach('connect', function (done) {
            this.publisher = Publish('8080')
            this.consumer = new Websocket('ws://localhost:8080')

            this.stream = createConnection(this.consumer)

            done()
        })

        afterEach('disconnect', function (done) {
            this.consumer.send('die')
            this.consumer.on('close', function () {
                done()
            })

            this.stream = null
        })

        it('receives a message', function (done) {
            const sub = take.call(this.stream, 1)

            sub.subscribe(function (message) {
                expect(message).to.equal('OPEN')

                done()
            })
        })

        it('receives a stream of messages', function (done) {
            const sub = take.call(this.stream, 3).toArray()

            sub.subscribe(function (message) {
                const expected = ['OPEN', '1', '2']

                expect(_.isEqual(message, expected)).to.equal(true)

                done()
            })
        })
    })

    describe('error', function () {
        xit('forwards socket errors to onError', function (done) {
            Err('8080')
            var consumer = new Websocket('ws://localhost:8080')
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
            Publish('8080')
            var consumer = new Websocket('ws://localhost:8080')
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

            setTimeout(() => consumer.send('die'), 1000)
        })

    })

})
