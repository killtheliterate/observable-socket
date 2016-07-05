[![Build Status](https://travis-ci.org/killtheliterate/observable-socket.svg?branch=master)](https://travis-ci.org/killtheliterate/observable-socket)
[![NPM version](https://img.shields.io/npm/v/observable-socket.svg)](https://www.npmjs.com/package/observable-socket)

# observable-socket

An observable socket, no duh. Tested with
[ws](https://github.com/websockets/ws) and
[window.WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket). 

Observable Socket assumes a few things:
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

# Subjects...
More to come...
