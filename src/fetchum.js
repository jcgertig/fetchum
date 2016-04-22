/* global FormData, fetch */
/**
 * Fetchum - Better Fetch
 */

require('es6-promise').polyfill();
require('isomorphic-fetch');

import {forEach, cloneDeep, isArray, isObject, toLower} from 'lodash';
import LocalStorage from './localStorage';

/**
 * Return the api url base
 *
 */
function _getBase() {
  let base = '';
  if (typeof process !== 'undefined' && typeof process.env !== 'undefined') {
    if (typeof process.env.API_BASE !== 'undefined') {
      base = process.env.API_BASE;
    }
  } else if (typeof window.API_BASE !== 'undefined') {
    base = window.API_BASE;
  }
  return base;
}

/**
 * Recursive tranform json to form data
 * @param  {Object} body
 * @param  {Object} formData
 * @param  {String} originalKey
 *
 */
function _transformFormBody(body, formData, originalKey) {
  let data = cloneDeep(formData);
  forEach(Object.keys(body), (paramKey) => {
    const obj = body[paramKey];
    const key = typeof originalKey !== 'undefined' ? `${originalKey}[${paramKey}]` : paramKey;
    if (isArray(obj)) {
      for (let k in obj) {
        data.append(`${key}[]`, obj[k]);
      }
    } else if (isObject(obj)) {
      data = _transformFormBody(obj, data, key);
    } else {
      data.append(key, obj);
    }
  });
  return data;
}

/**
 * Prep body for request
 * @param  {Object} body
 * @param  {Boolean} isFormData
 *
 */
function _transformBody(body = {}, isFormData = false) {
  if (!isFormData) { return JSON.stringify(body); }
  return _transformFormBody(body, new FormData());
}

/**
 * Prep url for request
 * @param  {Object} params
 *
 */
function _transformUrlParams(params = {}) {
  let formatedParams = [];
  forEach(Object.keys(params), (key) => {
    formatedParams.push(`${key}=` + encodeURIComponent(params[key]));
  });
  return formatedParams;
}

function _request(isFormData, method, url, body = {}, headers = {}, credentials = 'include') {
  const defaultHeaders = { 'Accept': 'application/json' };
  let newUrl = cloneDeep(url);

  let fetchData = {
    method: toLower(method),
    headers: Object.assign({}, defaultHeaders, headers),
  };

  if (toLower(method) !== 'get') {
    fetchData.body = _transformBody(body, isFormData);
  } else {
    let params = _transformUrlParams(body);
    if (params.length > 0) {
      newUrl += '?' + params.join('&');
    }
  }

  return new Promise((resolve, reject) => {
    fetch(newUrl, fetchData)
      .then((response) => {
        if (response.status === 200 || response.status === 201) {
          response.json()
            .then((data) => resolve(data))
            .catch((res) => reject(res));
        } else {
          reject(response);
        }
      })
      .catch((res) => reject(res));
  });
}

/**
 * Calls the request and prepends route with base
 * @param  {Object} options = {method, route, form, external}
 * @param  {Object} body
 * @param  {Object} headers
 * @param  {String} credentials
 *
 */
function _apiRequest({method, route, form, external}, body = {}, headers = {}, credentials) {
  const url = external ? route : `${_getBase()}${route}`;
  return _request(form, method, url, body, headers, credentials);
}

/**
 * Replace keys in string format :key with value in params
 * @param  {String} route
 * @param  {Object} params
 *
 */
function _parameterizeRoute(route, params) {
  let parameterized = cloneDeep(route);
  forEach(params, (v, k) => {
    if (typeof v === 'undefined') { console.warn(`error: parameter ${k} was ${v}`); }
    parameterized = parameterized.replace(':' + k, v);
  });
  return parameterized;
}

/**
 * Call a api request without a token header
 * @param  {Object} options - {method, token, route, external, form }
 * @param  {Object} params
 * @param  {Object} body
 * @param  {Object} headers
 * @param  {Object} credentials
 *
 */
function _publicRequest(options, params, body = {}, headers, credentials) {
  let cloned = cloneDeep(options);
  if (params) { cloned.route = _parameterizeRoute(cloned.route, params); }
  return _apiRequest(cloned, body, headers, credentials);
}

/**
 * Call a api request and set Auth header
 * @param  {Object} options - {method, token, route, external, form }
 * @param  {Object} params
 * @param  {Object} body
 * @param  {String} customToken
 * @param  {Object} headers
 * @param  {Object} credentials
 *
 */
function _requestWithToken(options, params, body = {}, customToken, headers, credentials) {
  let cloned = cloneDeep(options);
  if (params) { cloned.route = _parameterizeRoute(cloned.route, params); }
  const token = LocalStorage.get('token');
  const requestHeaders = Object.assign({}, headers, {
    'Authorization': 'Bearer ' + (customToken || token),
  });
  return _apiRequest(cloned, body, requestHeaders, credentials);
}

/**
 * Generate a api request
 * @param  {Object} options - {method, token, route, external, form }
 *
 */
export const generateRequest = (options) => {
  options.form = options.form || false;
  options.external = options.external || false;
  if (options.external) { return _publicRequest.bind(this, options); }

  return options.token ? (
    _requestWithToken.bind(this, options)
  ) : (
    _publicRequest.bind(this, options)
  );
};

export const getReq = _request.bind(null, false, 'get');
export const postReq = _request.bind(null, false, 'post');
export const putReq = _request.bind(null, false, 'put');
export const deleteReq = _request.bind(null, false, 'delete');
export const patchReq = _request.bind(null, false, 'patch');

export const apiGet = _apiRequest.bind(null, false, 'get');
export const apiPost = _apiRequest.bind(null, false, 'post');
export const apiPut = _apiRequest.bind(null, false, 'put');
export const apiDelete = _apiRequest.bind(null, false, 'delete');
export const apiPatch = _apiRequest.bind(null, false, 'patch');

export const apiRequest = _apiRequest;

export const postFormReq = _request.bind(null, true, 'post');
export const putFormReq = _request.bind(null, true, 'put');
export const apiFormPost = _apiRequest.bind(null, true, 'post');
export const apiFormPut = _apiRequest.bind(null, true, 'put');
