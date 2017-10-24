import { isUndefined } from 'lodash';
import BetterStorage from 'betterstorage';
import { LocalStorage } from 'node-localstorage';

const PRE_VAR = 'STORAGE_PREFIX';
function getStore() {
  if (typeof process === 'object' && `${process}` === '[object process]') {
    return LocalStorage;
  }
  return 'local';
}

function getPrefix() {
  let prefix = '';
  if (!isUndefined(process || undefined) && !isUndefined(process.env)) {
    if (!isUndefined(process.env[PRE_VAR])) {
      prefix = process.env[PRE_VAR];
    }
  } else if (!isUndefined(window || undefined)) {
    if (!isUndefined(window, PRE_VAR)) {
      prefix = window[PRE_VAR];
    }
  }
  return prefix;
}

const store = new BetterStorage(getPrefix(), getStore());

export const storage = store;

/**
 * Gets an token from localStorage
 *
 */
export const getToken = () => (store.get('token').token);

/**
 * Sets the token in localStorage
 * @param  {Any} value
 *
 */
export const setToken = value => (store.set('token', { token: value }));

/**
 * Remove item from localStorage
 * @param  {String} id
 *
 */
export const removeToken = () => (store.remove('token'));
