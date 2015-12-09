import {expect} from 'chai'
import createServer from '../server'
import createConnection from '../../dist/index'


describe('connection.signal', function () {

    describe('#subscribe', function () {
        let server, connection

        beforeEach(function(done) {
            server = createServer()
            connection = createConnection('ws://localhost:8080')

            done()
        })

        afterEach(function(done) {
            server.close()
            connection = null

            done()
        })

        it ('connects to the socket', function(done) {
            connection.signal.subscribe(function (message) {
                expect(message).to.equal('Socket opened')
                done()
            })
        })

        it ('hears subsequent messages', function(done) {
            const ob = connection.signal.concatAll()

            connection.send('one')
            connection.send('two')
            connection.send('three')

            // server.close()

            ob.subscribe(function (message) {
                console.log(message)
                expect(message).to.equal('Socket opened')
                done()
            })
        })
    })
})
