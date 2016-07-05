import Websocket from 'ws'
import { expect } from 'chai'

import createConnection from '../../../dist/index'
import { Echo } from '../../server'

// Observable operators
import { take } from 'rxjs/operator/take'

describe('socket.next', function () {

    describe('open socket', function () {
        it('sends immediately if socket is already open', function (done) {
            this.timeout(3000)

            const publisher = Echo('8080')
            const socket = new Websocket('ws://localhost:8080')

            setTimeout(function () {
                const stream = createConnection(socket)

                stream.next('old socket')

                var sub = take.call(stream, 1)

                sub.subscribe(function (el) {
                    expect(el).to.equal('Echo: old socket')

                    publisher.close()

                    done()
                })
            }, 100)
        })
    })

    describe('new socket', function () {
        it('waits to send until socket is open', function (done) {
            const publisher = Echo('8080')
            const stream = createConnection(new Websocket('ws://localhost:8080'))

            stream.next('new socket')

            var sub = take.call(stream, 1)

            sub.subscribe(function (el) {
                expect(el).to.equal('Echo: new socket')

                publisher.close()

                done()
            })

        })
    })

})
