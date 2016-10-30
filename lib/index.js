'use strict';

exports.__esModule = true;
exports.LocalStorage = undefined;

var _fetchum = require('./fetchum');

Object.keys(_fetchum).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _fetchum[key];
    }
  });
});

var _localStorage = require('./localStorage');

var storage = _interopRequireWildcard(_localStorage);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var LocalStorage = exports.LocalStorage = storage;