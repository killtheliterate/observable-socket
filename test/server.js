import {Server} from 'ws'

export default function createServer () {
    var server = new Server({port: 8080})

    server.on('connection', function(socket) {
        socket.send('Socket opened')

        // echo
        socket.on('message', msg => socket.send('Echo: ' + msg))
    })

    return server
}
