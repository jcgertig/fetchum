require('object.assign').shim();

import * as fetchum from './fetchum';
import * as storage from './localStorage';

export * from './fetchum';

export const LocalStorage = storage;

export default Object.assign({}, fetchum, {LocalStorage: storage});
