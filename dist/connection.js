'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = observeableSocket;

var _ws2 = require('ws');

var _ws3 = _interopRequireDefault(_ws2);

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fromEvent = _rx2.default.Observable.fromEvent;

function observeableSocket(socketAddress) {
    var _vent = new _events.EventEmitter();
    var _ws = new _ws3.default(socketAddress);

    var _openStream = fromEvent(_ws, 'open');

    var address = new Promise(function (resolve) {
        var stream = _openStream.subscribe(function () {
            return resolve(function (message) {
                return _ws.send(JSON.stringify(message));
            });
        });

        _vent.on('dispose', function () {
            return stream.dispose();
        });
    });

    // Compose socket event streams, so that external subscribers have
    // a single interface that follows the typical observer signature.
    var socketStream = _rx2.default.Observable.create(function (observer) {
        var _messageStream = _openStream.flatMap(function () {
            return fromEvent(_ws, 'message');
        });

        var closeSub = fromEvent(_ws, 'close').subscribe(function (e) {
            return observer.onCompleted(e);
        });
        var errorSub = fromEvent(_ws, 'error').subscribe(function (e) {
            return observer.onError(e);
        });
        var messageSub = _messageStream.subscribe(function (e) {
            return observer.onNext(e);
        });

        return function () {
            closeSub.dispose();
            errorSubdispose();
            messageSub.dispose();

            _vent.emit('dispose'); // destroy send stream
        };
    });

    return {
        send: function send(message) {
            address.then(function (proxy) {
                return proxy(message);
            });
        },

        signal: socketStream
    };
}