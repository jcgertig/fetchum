import * as fetchum from './fetchum';
import * as storage from './localStorage';

export const LocalStorage = storage;

export default { ...fetchum, ...storage, LocalStorage };
