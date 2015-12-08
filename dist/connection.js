'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = observeableSocket;

var _ws2 = require('ws');

var _ws3 = _interopRequireDefault(_ws2);

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fromEvent = _rx2.default.Observable.fromEvent;

function observeableSocket(socketAddress) {
    var _ws = new _ws3.default(socketAddress);

    var openStream = fromEvent(_ws, 'open');
    var closeStream = fromEvent(_ws, 'close');

    var messageStream = openStream.flatMap(function () {
        return fromEvent(_ws, 'message');
    }).takeUntil(closeStream);

    var address = new Promise(function (resolve) {
        openStream.subscribe(function () {
            return resolve(function (message) {
                return _ws.send(JSON.stringify(message));
            });
        });
    });

    return {
        send: function send(message) {
            address.then(function (proxy) {
                return proxy(message);
            });
        },

        signal: messageStream
    };
}