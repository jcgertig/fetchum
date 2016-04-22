import * as fetchum from './fetchum';
import storage from './localStorage';

export * from './fetchum';

export const localStorage = storage;

export default Object.assign({}, fetchum, {localStorage: storage});
