'use strict';

exports.__esModule = true;

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

var _storage = require('./storage');

Object.keys(_storage).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _storage[key];
    }
  });
});
var LocalStorage = exports.LocalStorage = storage;