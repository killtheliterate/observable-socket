[![Build Status](https://travis-ci.org/killtheliterate/observable-socket.svg?branch=master)](https://travis-ci.org/killtheliterate/observable-socket)
[![NPM version](https://img.shields.io/npm/v/observable-socket.svg)](https://www.npmjs.com/package/observable-socket)

# observable-socket

An observable socket, no duh. Tested with
[ws](https://github.com/websockets/ws) and
[window.WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket). 

`observable-socket` assumes a few things:
* Promises are available. If you're targeting an environment that does not
  support native Promises, use
  [babel-polyfill](https://babeljs.io/docs/usage/polyfill/) or something
  similar.
* You'll be using something like [Browserify](http://browserify.org/) or
  [webpack](https://webpack.github.io/) when writing for the web.

# Usage

install it.

```shell
npm install observable-socket
```

import and use it.

```js
import observableSocket from 'observable-socket'

/**
 * Create an echo socket by connecting to the echo socket provided by
 * websocket.org.
 */
const echoSocket = observableSocket(new WebSocket('wss://echo.websocket.org'))

/**
 * Subscribing to `echoSocket` receives messages from the underlying
 * WebSocket.
 */
echoSocket.subscribe(

  function next (data) {
    console.log(data)
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
echoSocket.next('hi!')

```

# API

This module exports a function that takes a WebSocket, and returns an RxJS
[Subject](http://reactivex.io/rxjs/class/es6/Subject.js~Subject.html).

Here's how to get a socket that connects to websocket.org's echo websocket:

```js
import observableSocket from 'observable-socket'

const socket = observableSocket(new WebSocket('wss://echo.websocket.org'))
```

## socket.subscribe

The `subscribe` represents incoming messages from the socket.

## socket.next

`next` is a function to push messages into the socket. This will create
a queue of messages that will not be sent until the socket is connected.

# Reconnecting...

`observable-socket` does not construct websockets, therefore there isn't
a notion of "healing" a connection. Instead, when a socket drops, the
`complete` of `observable-socket` is called, which can be leveraged into
creating a new socket, and re-wrapping `observable-socket` around it. An
example of how this can be done:

[requirebin](http://requirebin.com/?gist=2ec1f61d5404733d6918483730170447)

```javascript
import observableSocket from 'observable-socket')
import Rx from 'rxjs'
import EventEmitter from 'events'

function makeObservableLoop (socketEmitter, send, receive) {
    socketEmitter.once('open', function onSocketEmit (wSocket) {
        const oSocket = observableSocket(wSocket)
        const sendSubscription = send.subscribe(msg => oSocket.next(msg))

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
        read: receive,
    }
}

const emitter = new EventEmitter()

makeSocketLoop(emitter)
const theSubjectz = init(emitter)

setInterval(function () {
  theSubjectz.send('echo, you there?')
}, 1000)

theSubjectz.read.subscribe(function (el) {
  console.log(el)
})
```
