/* global FormData, fetch, Headers, Request, window, File, Blob */
/**
 * LocalStorage Wrapper
 */
import { isUndefined, has, assign } from 'lodash';

if (!has(Object, 'assign')) {
  Object.assign = assign;
}

const PRE_VAR = 'STORAGE_PREFIX';
function getStore() {
  if (isUndefined(window) || isUndefined(window.localStorage) || window.localStorage === null) {
    return require('node-localstorage').LocalStorage;
  }
  return window.localStorage;
}

/**
 * Return the storage prefix
 *
 */
export const getPrefix = () => (!isUndefined(window, PRE_VAR) ? window[PRE_VAR] : '');

/**
 * Gets an item from localStorage
 * @param  {string} id
 *
 */
export const get = (id) => {
  try {
    return JSON.parse(getStore().getItem(`${getPrefix()}-${id}`)).value;
  } catch (err) {
    return null;
  }
};

/**
 * Sets an item in localStorage
 * @param  {String} id
 * @param  {Any}    value
 *
 */
export const set = (id, value) => {
  return getStore().setItem(`${getPrefix()}-${id}`, JSON.stringify({ value }));
};

/**
 * Remove item from localStorage
 * @param  {String} id
 *
 */
export const remove = (id) => (getStore().removeItem(`${getPrefix()}-${id}`));

/**
 * Gets an token from localStorage
 *
 */
export const getToken = () => (get('token'));

/**
 * Sets the token in localStorage
 * @param  {Any} value
 *
 */
export const setToken = (value) => (set('token', value));

/**
 * Remove item from localStorage
 * @param  {String} id
 *
 */
export const removeToken = () => (remove('token'));

/**
 * Return state to rehydrate store
 * @return {Object}
 *
 */
export const getHydratedState = () => {
  const state = get('state');
  return state || {};
};

/**
 * Sets the hydrated state
 * @param  {Object} state
 *
 */
export const setHydratedState = (state) => (set('state', state));

/**
 * Adds a key to hydrated state
 * @param  {String} id
 * @param  {Any}  value
 */
export const addHydratedState = (id, value) => {
  return set('state', Object.assign({}, getHydratedState(), { id: value }));
};

/**
 * Checks if an item exists
 * @param  {string} id
 *
 */
export const isSet = (id) => (get(id) !== null);
