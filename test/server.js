import http from 'http'
import SocketIO from 'socket.io'

export default function() {
    const io = SocketIO(http.createServer())

    io.on('connection', socket => {

      socket.emit('pong', 'hello')

      setTimeout(() => socket.emit('pong', 'bye'), 1000)

      socket.on('ping', message => {
        socket.emit('pong', message)
      })
    })

    io.listen('3005')
}
