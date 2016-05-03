/**
 * LocalStorage Wrapper
 */
import { isUndefined, has, assign } from 'lodash';

if (!has(Object, 'assign')) {
  Object.assign = assign;
}

/**
 * Return the storage prefix
 *
 */
export const getPrefix = () => {
  return !isUndefined(window, 'STORAGE_PREFIX') ? window.STORAGE_PREFIX : '';
};

const Store = window.localStorage;

/**
 * Gets an item from localStorage
 * @param  {string} id
 *
 */
export const get = (id) => {
  try {
    return JSON.parse(Store.getItem(`${getPrefix()}-${id}`)).value;
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
  return Store.setItem(`${getPrefix()}-${id}`, JSON.stringify({ value }));
};

/**
 * Remove item from localStorage
 * @param  {String} id
 *
 */
export const remove = (id) => {
  return Store.removeItem(`${getPrefix()}-${id}`);
};

/**
 * Gets an token from localStorage
 *
 */
export const getToken = () => {
  return get('token');
};

/**
 * Sets the token in localStorage
 * @param  {Any} value
 *
 */
export const setToken = (value) => {
  return set('token', value);
};

/**
 * Remove item from localStorage
 * @param  {String} id
 *
 */
export const removeToken = () => {
  return remove('token');
};

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
export const setHydratedState = (state) => {
  return set('state', state);
};

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
export const isSet = (id) => {
  return get(id) !== null;
};
