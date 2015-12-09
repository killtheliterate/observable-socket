import {expect} from 'chai'
import server from '../server'
import createConnection from '../../dist/index'


describe('connection.signal', function () {
    server() // echo server
    const connection = createConnection('http://localhost:3005')

    it('#subscribe', function (done) {
        connection.signal.subscribe(function (message) {
            expect(true).to.equal(true)
            done()
        })
    })
})
