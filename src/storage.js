import { isUndefined } from 'lodash';
import BetterStorage from 'betterstorage';
import { autobind } from 'core-decorators';

const PRE_VAR = 'FETCHUM_PREFIX';
const TYPE_VAR = 'FETCHUM_STORE_TYPE';

function notUndef(val) {
  return (!isUndefined(val) && val !== 'undefined');
}

function getVar(defaultVal, name, orName) {
  let val = defaultVal;
  if (notUndef(process || undefined) && notUndef(process.env)) {
    if (notUndef(process.env[name]) || notUndef(process.env[orName])) {
      val = process.env[name] || process.env[orName];
    }
  } else if (notUndef(window || undefined)) {
    if (notUndef(window[name]) || notUndef(window[orName])) {
      val = window[name] || window[orName];
    }
  }
  return val;
}

@autobind
export class Storage {
  constructor(storageOverideMethods) {
    this.type = this.type.bind(this, storageOverideMethods);
  }

  get prefix() { // eslint-disable-line class-methods-use-this
    return getVar('', PRE_VAR, 'STORAGE_PREFIX');
  }

  get storageType() { // eslint-disable-line class-methods-use-this
    return getVar('local', TYPE_VAR, 'STORAGE_TYPE');
  }

  type(storageOverideMethods) {
    if (notUndef(storageOverideMethods) && typeof storageOverideMethods === 'object') {
      return storageOverideMethods;
    }
    const type = this.storageType;
    if (typeof process === 'object' && `${process}` === '[object process]') {
      return {
        setItem: () => {},
        getItem: () => {},
        removeItem: () => {},
        key: () => {},
        clear: () => {},
        length: 0,
      };
    }
    return type;
  }

  store(storeOveride) {
    return storeOveride || new BetterStorage(this.prefix, this.type());
  }

  /**
   * Gets an token from storage
   *
   */
  getToken(storeOveride) {
    return new Promise((accept, reject) => (
      this.store(storeOveride).get('token')
      .then(({ token }) => accept(token))
      .catch(reject)
    ));
  }

  /**
   * Sets the token in storage
   * @param  {Any} token
   *
   */
  setToken(token, storeOveride) {
    return (this.store(storeOveride).set('token', { token }));
  }

  /**
   * Remove item from storage
   * @param  {String} id
   *
   */
  removeToken(storeOveride) {
    return (this.store(storeOveride).remove('token'));
  }
}

export default new Storage();
