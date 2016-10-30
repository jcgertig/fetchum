var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

import * as fetchum from './fetchum';
import * as storage from './localStorage';

export var LocalStorage = storage;

export default _extends({}, fetchum, storage, { LocalStorage: LocalStorage });