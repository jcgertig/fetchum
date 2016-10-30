'use strict';

exports.__esModule = true;
exports.LocalStorage = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _fetchum = require('./fetchum');

var fetchum = _interopRequireWildcard(_fetchum);

var _localStorage = require('./localStorage');

var storage = _interopRequireWildcard(_localStorage);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var LocalStorage = exports.LocalStorage = storage;

exports['default'] = _extends({}, fetchum, storage, { LocalStorage: LocalStorage });