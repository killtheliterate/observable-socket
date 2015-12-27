import Websocket from 'ws'
import _ from 'lodash'
import {expect} from 'chai'

import createConnection from '../../../dist/index'
import { Echo } from '../server'

describe('socket.send', function () {

    describe('open socket', function() {
        it('sends immediately if socket is already open', function(done) {
            this.timeout(3000)

            const publisher = Echo('8080')
            const socket = new Websocket('ws://localhost:8080')

            setTimeout(function() {
                const stream = createConnection(socket)

                stream.send('old socket')

                var sub = stream.observable.take(1)

                sub.subscribe(function(el) {
                    expect(el).to.equal('Echo: old socket')

                    publisher.close()

                    done()
                })
            }, 100)
        })
    })

    describe('new socket', function() {
        it('waits to send until socket is open', function(done) {
            const publisher = Echo('8080')
            const stream = createConnection(new Websocket('ws://localhost:8080'))

            stream.send('new socket')

            var sub = stream.observable.take(1)

            sub.subscribe(function(el) {
                expect(el).to.equal('Echo: new socket')

                publisher.close()

                done()
            })

        })
    })

})
