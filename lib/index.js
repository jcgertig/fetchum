(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './fetchum', './utils', './base', './storage'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./fetchum'), require('./utils'), require('./base'), require('./storage'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.fetchum, global.utils, global.base, global.storage);
    global.index = mod.exports;
  }
})(this, function (exports, _fetchum, _utils, _base, _storage) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Fetchum = exports.setConfig = exports.LocalStorage = undefined;
  Object.keys(_fetchum).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _fetchum[key];
      }
    });
  });
  Object.defineProperty(exports, 'setConfig', {
    enumerable: true,
    get: function () {
      return _utils.setConfig;
    }
  });

  var _base2 = _interopRequireDefault(_base);

  var _storage2 = _interopRequireDefault(_storage);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  exports.LocalStorage = _storage2.default;
  var Fetchum = exports.Fetchum = _base2.default;

  exports.default = new _base2.default();
});