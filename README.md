[![Build Status](https://travis-ci.org/killtheliterate/observable-socket.svg?branch=master)](https://travis-ci.org/killtheliterate/observable-socket)
[![NPM version](https://img.shields.io/npm/v/observable-socket.svg)](https://www.npmjs.com/package/observable-socket)

# observable-socket

An observable socket, no duh. Tested with
[ws](https://github.com/websockets/ws) and
[window.WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket). 

Observable-socket assumes a few things:
* Promises are available. If you're targeting an environment that does not
  support native Promises, use
  [babel-polyfill](https://babeljs.io/docs/usage/polyfill/) or something
  similar.
* You'll be using something like [Browserify](http://browserify.org/) or
  [webpack](https://webpack.github.io/) if working with window.WebSocket.

# Usage

install it.

```shell
npm install observable-socket
```

import and use it.

```js
import ObservableSocket from 'observable-socket'

/**
 * Create an echo socket by connecting to the echo socket provided by
 * websocket.org.
 */
const echoSocket = ObservableSocket(new WebSocket('wss://echo.websocket.org'))

/**
 * We can send messages before we subscribe.
 */
echoSocket.send('hi!')

/**
 * Subscribing to the `echoSocket.observable` connects to the socket.
 */
echoSocket.observable.subscribe(

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
```

# API

This module exports a function that takes a WebSocket url and returns an object
of the shape:

```
{
  send: <Function>,
  observable: <Observable>
}
```

We will call that shape `socket`.

Here's how to get a socket that connects to websocket.org's echo websocket:

```js
import ObservableSocket from 'observable-socket'

const socket = ObservableSocket(new WebSocket('wss://echo.websocket.org'))
```

## socket.observable

The observable is an [RxJS5](https://github.com/ReactiveX/rxjs) observable
that represents incoming messages from the socket.

## socket.send

`send` is a function to push messages into the socket. This will create
a queue of messages that will not be sent until the socket is connected.
