[![Build Status](https://travis-ci.org/killtheliterate/observable-socket.svg?branch=master)](https://travis-ci.org/killtheliterate/observable-socket)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![npm version](https://img.shields.io/npm/v/observable-socket.svg)](https://www.npmjs.com/package/observable-socket)

# observable-socket

[![Greenkeeper badge](https://badges.greenkeeper.io/killtheliterate/observable-socket.svg)](https://greenkeeper.io/)

An observable socket, no duh. Tested with
[ws](https://github.com/websockets/ws) and
[window.WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket). 

`observable-socket` assumes a few things:
* Promises are available. If you're targeting an environment that does not
  support native Promises, use
  [babel-polyfill](https://babeljs.io/docs/usage/polyfill/) or something
  similar.
* JavaScript is still [relevant](https://en.wikipedia.org/wiki/Relevance)

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
    window.debug = lbl => msg => console.log(`${lbl}: ${msg}`) // debug however you like
</script>
<script type="text/javascript" src="https://unpkg.com/@reactivex/rxjs/dist/global/Rx.js"></script>
<script type="text/javascript" src="https://unpkg.com/observable-socket@5.0.2/dist/umd/index.min.js"></script>

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
`subscribe` to it.

# Reconnecting...

`observable-socket` does not construct WebSockets, therefore there isn't
a notion of "healing" a connection. Instead, when a socket drops, the
`complete` of `observable-socket` is called, which can be leveraged into
creating a new socket, and re-wrapping `observable-socket` around it. An
example of how this can be done:

* [requirebin](http://requirebin.com/?gist=2ec1f61d5404733d6918483730170447)
* [gist](https://gist.github.com/killtheliterate/2ec1f61d5404733d6918483730170447#file-index-js)

# Bundles and packages and boxes and goodies...

There are a few different bundles in `dist/`:

* umd
* commonjs
* esm
* commonjs and esm [observable](https://github.com/ReactiveX/RxJS#es6-via-npm)
  without any operator bindings.

If you want to keep your build size a lot smaller, you can use
`observable-socket` with `RxJS` operators, like so:

```javascript
import observableSocket from 'observable-socket/dist/esm/bind'
import { map } from 'rxjs/operator/map'

// This requires a transpile step for https://github.com/tc39/proposal-bind-operator
const echoSocket = observableSocket(new WebSocket('wss://echo.websocket.org'))
echoSocket::map(msg => `mapped... ${msg}`)

// OR...
map.call(echoSocket, msg => `mapped... ${msg}`)
```
