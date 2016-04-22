import * as fetchum from './fetchum';
import localStorage from './localStorage';

export * from './fetchum';

export default Object.assign({}, fetchum, {localStorage});
