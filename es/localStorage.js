/* global FormData, fetch, Headers, Request, window, File, Blob */
/**
 * LocalStorage Wrapper
 */
import { isUndefined, has, assign } from 'lodash-es';

if (!has(Object, 'assign')) {
  Object.assign = assign;
}

var PRE_VAR = 'STORAGE_PREFIX';
function getStore() {
  if (typeof process === 'object' && '' + process === '[object process]') {
    return require('node-localstorage').LocalStorage;
  }
  return window.localStorage;
}

/**
 * Return the storage prefix
 *
 */
export var getPrefix = function getPrefix() {
  var prefix = '';
  if (!isUndefined(process) && !isUndefined(process.env) && !isUndefined(process.env[PRE_VAR])) {
    prefix = process.env[PRE_VAR];
  }
  if (prefix === '' && !isUndefined(window) && !isUndefined(window, PRE_VAR)) {
    prefix = window[PRE_VAR];
  }
  return prefix;
};

/**
 * Gets an item from localStorage
 * @param  {string} id
 *
 */
export var get = function get(id) {
  try {
    return JSON.parse(getStore().getItem(getPrefix() + '-' + id)).value;
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
export var set = function set(id, value) {
  return getStore().setItem(getPrefix() + '-' + id, JSON.stringify({ value: value }));
};

/**
 * Remove item from localStorage
 * @param  {String} id
 *
 */
export var remove = function remove(id) {
  return getStore().removeItem(getPrefix() + '-' + id);
};

/**
 * Gets an token from localStorage
 *
 */
export var getToken = function getToken() {
  return get('token');
};

/**
 * Sets the token in localStorage
 * @param  {Any} value
 *
 */
export var setToken = function setToken(value) {
  return set('token', value);
};

/**
 * Remove item from localStorage
 * @param  {String} id
 *
 */
export var removeToken = function removeToken() {
  return remove('token');
};

/**
 * Return state to rehydrate store
 * @return {Object}
 *
 */
export var getHydratedState = function getHydratedState() {
  var state = get('state');
  return state || {};
};

/**
 * Sets the hydrated state
 * @param  {Object} state
 *
 */
export var setHydratedState = function setHydratedState(state) {
  return set('state', state);
};

/**
 * Adds a key to hydrated state
 * @param  {String} id
 * @param  {Any}  value
 */
export var addHydratedState = function addHydratedState(id, value) {
  return set('state', Object.assign({}, getHydratedState(), { id: value }));
};

/**
 * Checks if an item exists
 * @param  {string} id
 *
 */
export var isSet = function isSet(id) {
  return get(id) !== null;
};

/**
 * Checks if has token
 * @param  {Any} value
 *
 */
export var hasToken = function hasToken() {
  return isSet('token');
};