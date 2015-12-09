'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = observableSocket;

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fromEvent = _rx2.default.Observable.fromEvent;

function observableSocket(_ws) {
    var _vent = new _events.EventEmitter();

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

        var closeDisposable = fromEvent(_ws, 'close').subscribe(function (e) {
            return observer.onCompleted(e);
        });
        var errorDisposable = fromEvent(_ws, 'error').subscribe(function (e) {
            return observer.onError(e);
        });
        var messageDisposable = _messageStream.subscribe(function (e) {
            return observer.onNext(e);
        });

        return function () {
            closeDisposable.dispose();
            errorDisposable.dispose();
            messageDisposable.dispose();

            _ws.close(); // dispose of the websocket

            _vent.emit('dispose'); // destroy send stream
        };
    });

    return {
        send: function send(message) {
            address.then(function (proxy) {
                return proxy(message);
            });
        },

        observable: socketStream
    };
}