(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './fetchum', './utils', './storage'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./fetchum'), require('./utils'), require('./storage'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.fetchum, global.utils, global.storage);
    global.index = mod.exports;
  }
})(this, function (exports, _fetchum, _utils, _storage) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.setConfig = exports.LocalStorage = undefined;
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

  var _LocalStorage = _interopRequireWildcard(_storage);

  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};

      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
        }
      }

      newObj.default = obj;
      return newObj;
    }
  }

  exports.LocalStorage = _LocalStorage;
});