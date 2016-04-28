const assign = require('object.assign/polyfill')();

import * as fetchum from './fetchum';
import * as storage from './localStorage';

export * from './fetchum';

export const LocalStorage = storage;

export default assign({}, fetchum, {LocalStorage: storage});
