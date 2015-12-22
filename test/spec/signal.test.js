import Websocket from 'ws'
import _ from 'lodash'
import {expect} from 'chai'

import createConnection from '../../dist/index'
import createServer from '../server'

describe('connection.signal', function () {

    describe('#subscribe', function () {
        let publisher, consumer, stream

        beforeEach(function(done) {
            publisher = createServer('8080')
            consumer = new Websocket('ws://localhost:8080')

            stream = createConnection(consumer)

            done()
        })

        afterEach(function(done) {
            publisher.close()
            stream = null

            done()
        })

        it('connects to the socket', function(done) {
            stream.observable.subscribe(function (message) {
                expect(message).to.equal('Socket opened')
                done()
            })
        })

        it('hears subsequent messages', function(done) {
            stream.send('yup')
            stream.send('yup')

            const messages = stream.observable.take(3).toArray()

            messages.subscribe(function(message) {
                const expected = ['Socket opened', 'Echo: "yup"', 'Echo: "yup"']

                expect(_.isEqual(message, expected)).to.equal(true)

                done()
            })
        })
    })
})
