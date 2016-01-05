import Websocket from 'ws'
import _ from 'lodash'
import { expect } from 'chai'

import createConnection from '../../../dist/index'
import { Publish, Err } from '../../server'

describe('socket.observable', function () {

    describe('subscribe', function () {

        describe('onNext', function () {

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
                const sub = this.stream.observable.take(1)

                sub.subscribe(function (message) {
                    expect(message).to.equal('OPEN')

                    done()
                })
            })

            it('receives a stream of messages', function (done) {
                const sub = this.stream.observable
                    .take(3).toArray()

                sub.subscribe(function (message) {
                    const expected = ['OPEN', '1', '2']

                    expect(_.isEqual(message, expected)).to.equal(true)

                    done()
                })
            })
        })

        describe('onError', function () {
            xit('forwards socket errors to onError', function (done) {
                Err('8080')
                var consumer = new Websocket('ws://localhost:8080')
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
                Publish('8080')
                var consumer = new Websocket('ws://localhost:8080')
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

                setTimeout(() => consumer.send('die'), 1000)
            })

        })

    })
})
