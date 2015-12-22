import Websocket from 'ws'
import _ from 'lodash'
import {expect} from 'chai'

import createConnection from '../../dist/index'
import createServer from '../server'

describe('connection', function () {

    describe('#send', function () {
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

        it('echoes whatever is sent', function(done) {
            stream.send('hi')

            stream.observable.elementAt(1).subscribe(function(el) {
                expect(el).to.equal('Echo: "hi"')
                done()
            })
        })
    })
})
