import {Server} from 'ws'

export default function createServer (port) {
    var server = new Server({port: port})

    server.on('connection', function(socket) {
        socket.send('Socket opened')

        // echo
        socket.on('message', msg => socket.send('Echo: ' + msg))
    })

    return server
}
