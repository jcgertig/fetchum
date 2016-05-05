import { assign, has } from 'lodash';

if (!has(Object, 'assign')) {
  Object.assign = assign;
}

import * as fetchum from './fetchum';
import * as storage from './localStorage';

export * from './fetchum';

export const LocalStorage = storage;

export default Object.assign({}, fetchum, {LocalStorage: storage});
