require('babel-core/register')({presets: ['es2015']})

var debug = require('debug')
var Server = require('../server')

var log = debug('observable-socket:bootstrap')

log('kicking the websocket!')

// need to kill this node process after test suites have run

Server.Echo(8086)
Server.Publish(8087)
// Server.Error(8088)
