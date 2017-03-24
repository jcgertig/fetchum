'use strict';

exports.__esModule = true;
exports.hasToken = exports.isSet = exports.addHydratedState = exports.setHydratedState = exports.getHydratedState = exports.removeToken = exports.setToken = exports.getToken = exports.remove = exports.set = exports.get = exports.getPrefix = undefined;

var _lodash = require('lodash');

if (!(0, _lodash.has)(Object, 'assign')) {
  Object.assign = _lodash.assign;
} /* global FormData, fetch, Headers, Request, window, File, Blob */
/**
 * LocalStorage Wrapper
 */


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
var getPrefix = exports.getPrefix = function getPrefix() {
  var prefix = '';
  if (!(0, _lodash.isUndefined)(process) && !(0, _lodash.isUndefined)(process.env) && !(0, _lodash.isUndefined)(process.env[PRE_VAR])) {
    prefix = process.env[PRE_VAR];
  }
  if (prefix === '' && !(0, _lodash.isUndefined)(window) && !(0, _lodash.isUndefined)(window, PRE_VAR)) {
    prefix = window[PRE_VAR];
  }
  return prefix;
};

/**
 * Gets an item from localStorage
 * @param  {string} id
 *
 */
var get = exports.get = function get(id) {
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
var set = exports.set = function set(id, value) {
  return getStore().setItem(getPrefix() + '-' + id, JSON.stringify({ value: value }));
};

/**
 * Remove item from localStorage
 * @param  {String} id
 *
 */
var remove = exports.remove = function remove(id) {
  return getStore().removeItem(getPrefix() + '-' + id);
};

/**
 * Gets an token from localStorage
 *
 */
var getToken = exports.getToken = function getToken() {
  return get('token');
};

/**
 * Sets the token in localStorage
 * @param  {Any} value
 *
 */
var setToken = exports.setToken = function setToken(value) {
  return set('token', value);
};

/**
 * Remove item from localStorage
 * @param  {String} id
 *
 */
var removeToken = exports.removeToken = function removeToken() {
  return remove('token');
};

/**
 * Return state to rehydrate store
 * @return {Object}
 *
 */
var getHydratedState = exports.getHydratedState = function getHydratedState() {
  var state = get('state');
  return state || {};
};

/**
 * Sets the hydrated state
 * @param  {Object} state
 *
 */
var setHydratedState = exports.setHydratedState = function setHydratedState(state) {
  return set('state', state);
};

/**
 * Adds a key to hydrated state
 * @param  {String} id
 * @param  {Any}  value
 */
var addHydratedState = exports.addHydratedState = function addHydratedState(id, value) {
  return set('state', Object.assign({}, getHydratedState(), { id: value }));
};

/**
 * Checks if an item exists
 * @param  {string} id
 *
 */
var isSet = exports.isSet = function isSet(id) {
  return get(id) !== null;
};

/**
 * Checks if has token
 * @param  {Any} value
 *
 */
var hasToken = exports.hasToken = function hasToken() {
  return isSet('token');
};