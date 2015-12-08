#!/usr/bin/env node

var createConnection = require('../dist/connection').default
var connection = createConnection('wss://stchat.victorops.com/chat')

connection.signal.subscribe(function(message) {
    console.log(message)
})
