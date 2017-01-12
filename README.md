[![Build Status](https://travis-ci.org/killtheliterate/observable-socket.svg?branch=master)](https://travis-ci.org/killtheliterate/observable-socket)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![npm version](https://img.shields.io/npm/v/observable-socket.svg)](https://www.npmjs.com/package/observable-socket)

# observable-socket

An observable socket, no duh. Tested with
[ws](https://github.com/websockets/ws) and
[window.WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket). 

`observable-socket` assumes a few things:
* Promises are available. If you're targeting an environment that does not
  support native Promises, use
  [babel-polyfill](https://babeljs.io/docs/usage/polyfill/) or something
  similar.

# Usage

install it.

```shell
npm install observable-socket
```

import and use it.

```javascript
import observableSocket from 'observable-socket'
import ws from 'ws'

/**
 * Create an echo socket by connecting to the echo socket provided by
 * websocket.org.
 */
const echoSocket = observableSocket(ws('wss://echo.websocket.org'))

/**
 * Subscribing to `echoSocket` receives messages from the underlying
 * WebSocket.
 */
echoSocket.down.subscribe(
  function next (msg) {
    console.log(msg)
  },

  function error (e) {
    console.error('uh oh! ', e)
  },

  function complete () {
    console.warn('Socket has closed')
  }
)

/**
 * We can send messages too!
 */
echoSocket.up('hi!')

```

```html
<script type="text/javascript">
    window.debug = function () {} // debug however you like
</script>
<script type="text/javascript" src="https://unpkg.com/@reactivex/rxjs/dist/global/Rx.js"></script>
<script type="text/javascript" src="https://unpkg.com/observable-socket@5.0.0"></script>

<script>
    var socket = ObservableSocket(new WebSocket('wss://echo.websocket.org'))

    // Send messages up the socket
    socket.up('hello')

    // Receive messages down the socket
    socket.down.subscribe(
        msg => console.log(msg.data),
        () => console.log('done'),
        err => console.error(err)
    )
</script>
```

# Differences between 4.x and 5.x

- Having a bidirectional stream makes handling errors dumb, so
`observable-socket` isn't a `Subject` in the 5.x release.
- `observable-socket` no longer makes assumptions about what pieces of
a `message` you want.

# API

This module exports a function that takes a WebSocket, and returns an object
with two properties, `up` and `down`.

## socket.up

`up` is a function to push messages up the socket. This will create
a queue of messages that will not be sent until the socket is connected.

## socket.down

`down` is an [RxJS](https://github.com/ReactiveX/RxJS) stream. You can
`subscribe to it`.

# Reconnecting...

`observable-socket` does not construct websockets, therefore there isn't
a notion of "healing" a connection. Instead, when a socket drops, the
`complete` of `observable-socket` is called, which can be leveraged into
creating a new socket, and re-wrapping `observable-socket` around it. An
example of how this can be done:

[requirebin](http://requirebin.com/?gist=2ec1f61d5404733d6918483730170447)

```javascript
import EventEmitter from 'events'
import Rx from 'rxjs'
import observableSocket from 'observable-socket'

function makeObservableLoop (socketEmitter, send, receive) {
    socketEmitter.once('open', function onSocketEmit (wSocket) {
        const oSocket = observableSocket(wSocket)
        const sendSubscription = send.subscribe(msg => oSocket.up(msg))

        oSocket.subscribe(
            function onNext (msg) {
                receive.next(msg)
            },

            function onError (err) {
                error(err)
                sendSubscription.unsubscribe()

                makeObservableLoop(socketEmitter, send, receive)
            },

            function onComplete () {
                sendSubscription.unsubscribe()

                makeObservableLoop(socketEmitter, send, receive)
            }
        )
    })
}

function makeSocketLoop (emitter) {
  const websocket = new WebSocket('wss://echo.websocket.org')

  function onOpen () {
    emitter.emit('open', websocket)
    
    setTimeout(function () {
      websocket.close()
    }, 5000)
  }

  function onClose () {
    makeSocketLoop(emitter)
  }
  
  websocket.onopen = onOpen
  websocket.onclose = onClose
}

function init (socketEmitter) {
    const _send = new Rx.Subject()
    const _receive = new Rx.Subject()

    makeObservableLoop(socketEmitter, _send, _receive)

    const send = msg => _send.next(JSON.stringify(msg))
    const receive = _receive.asObservable()

    return {
        send: send,
        receive: receive,
    }
}

const emitter = new EventEmitter()

makeSocketLoop(emitter)
const persistent = init(emitter)

setInterval(function () {
  persistent.send('echo, you there?')
}, 1000)

persistent.receive.subscribe(function (el) {
  console.log(el)
})
```
