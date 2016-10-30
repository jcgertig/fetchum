/* global FormData, fetch, Headers, Request, window, File, Blob, self */
import { forEach, cloneDeep, isArray, isObject, toLower, isUndefined, has, assign } from 'lodash';
import { getToken } from './localStorage';

/**
 * Fetchum - Better Fetch
 */
global.self = global;
require('es6-promise').polyfill();

/** Detect free variable `global` from Node.js. */
const freeGlobal = typeof global === 'object' && global && global.Object === Object && global;
/** Detect free variable `self`. */
const freeSelf = typeof self === 'object' && self && self.Object === Object && self;
/** Used as a reference to the global object. */
const root = freeGlobal || freeSelf || Function('return this')();
/** Detect free variable `exports`. */
const freeExports = typeof exports === 'object' && exports && !exports.nodeType && exports;
/** Detect free variable `module`. */
const freeModule = freeExports && typeof module === 'object' && module && !module.nodeType && module;

let toReq = 'whatwg-fetch';
if (freeModule) {
  toReq = 'node-fetch';
}
const realFetch = require(toReq);

function newFetch(url, options) {
  if (/^\/\//.test(url)) {
    url = `https:${url}`;
  }
  return realFetch.call(root, url, options);
}

if (freeModule) {
  // Export for Node.js.
  if (!root.fetch) {
    root.fetch = newFetch;
    root.Response = realFetch.Response;
    root.Headers = realFetch.Headers;
    root.Request = realFetch.Request;
  }
}
root.fetch.bind(root);

if (!has(Object, 'assign')) {
  Object.assign = assign;
}

/**
 * Return the api url base
 *
 */
function _getBase() {
  let base = '';
  if (!isUndefined(process) && !isUndefined(process.env) && !isUndefined(process.env.API_BASE)) {
    base = process.env.API_BASE;
  }
  if (base === '' && !isUndefined(global) && !isUndefined(global.API_BASE)) {
    base = global.API_BASE;
  }
  return base;
}

/**
 * Check to see if object is json description of file
 * @param  {Object} val
 *
 */
function _isFile(val) {
  return (val instanceof File || val instanceof Blob);
}

/**
 * Recursive tranform json to form data
 * @param  {Object} body
 * @param  {Object} formData
 * @param  {String} originalKey
 *
 */
function _transformFormBody(body, formData, originalKey) {
  let data = formData;
  forEach(Object.keys(body), (paramKey) => {
    const obj = body[paramKey];
    const key = !isUndefined(originalKey) ? `${originalKey}[${paramKey}]` : paramKey;
    if (isArray(obj)) {
      for (let index = 0; index < obj.length; index++) {
        const val = obj[index];
        if ((isObject(val) && !_isFile(val)) || isArray(val)) {
          data = _transformFormBody(val, data, `${key}[${index}]`);
        } else {
          data.append(`${key}[${index}]`, val);
        }
      }
    } else if (isObject(obj) && !_isFile(obj)) {
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
function _transformUrlParams(params = {}, formatedParams = [], originalKey) {
  let data = formatedParams;
  for (const paramKey of Object.keys(params)) {
    const obj = params[paramKey];
    const key = !isUndefined(originalKey) ? `${originalKey}[${paramKey}]` : paramKey;
    if (isArray(obj)) {
      for (let index = 0; index < obj.length; index++) {
        const val = obj[index];
        if (isObject(val) || isArray(val)) {
          data = _transformUrlParams(val, data, `${key}[${index}]`);
        } else {
          data.push(`${key}[${index}]=${encodeURIComponent(val)}`);
        }
      }
    } else if (isObject(obj)) {
      data = _transformUrlParams(obj, data, key);
    } else {
      data.push(`${key}=${encodeURIComponent(obj)}`);
    }
  }
  return data;
}

/**
 * Base request call
 * @param  {Boolean} isFormData
 * @param  {String} method
 * @param  {String} url
 * @param  {Object} body
 * @param  {Object} headers
 *
 */
function _request(isFormData, method, url, body = {}, headers = {}, others = {}) {
  const defaultHeaders = {
    Accept: 'application/json',
  };
  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }
  let newUrl = cloneDeep(url);

  const fetchData = {
    method: toLower(method),
    headers: new Headers(Object.assign({}, defaultHeaders, headers)),
  };

  if (toLower(method) !== 'get') {
    fetchData.body = _transformBody(body, isFormData);
  } else {
    const params = _transformUrlParams(body);
    if (params.length > 0) {
      newUrl += `?${params.join('&')}`;
    }
  }

  const reqst = new Request(newUrl, Object.assign({}, others, fetchData));

  return new Promise((resolve, reject) => {
    root.fetch(reqst)
      .then((response) => {
        if (response.ok) {
          response.text()
            .then((data) => {
              let json = null;
              try {
                json = JSON.parse(data);
              } catch (e) {
                // test parsing json
              }
              response.data = (json !== null ? json : data);
              return resolve(response);
            })
            .catch(() => reject(response));
        } else {
          reject(response);
        }
      })
      .catch(response => reject(response));
  });
}

/**
 * Calls the request and prepends route with base
 * @param  {Boolean} form
 * @param  {String} method
 * @param  {String} route
 * @param  {Object} body
 * @param  {Object} headers
 *
 */
function _apiRequest(form, method, route, body, headers, others) {
  return _request(form, method, `${_getBase()}${route}`, body, headers, others);
}

/**
 * Calls the request and prepends route with base
 * @param  {Object} options = {method, route, form, external}
 * @param  {Object} body
 * @param  {Object} headers
 *
 */
function _callRequest({ method, route, form, external, others }, body, headers) {
  if (external) {
    return _request(form, method, route, body, headers, others);
  }
  return _apiRequest(form, method, route, body, headers, others);
}

/**
 * Replace keys in string format :key with value in params
 * @param  {String} route
 * @param  {Object} params
 *
 */
function _parameterizeRoute(route, params) {
  let parameterized = cloneDeep(route);
  forEach(params, (val, key) => {
    if (isUndefined(val)) { console.warn(`error: parameter ${key} was ${val}`); }
    parameterized = parameterized.replace(`:${key}`, val);
  });
  return parameterized;
}

/**
 * Call a api request without a token header
 * @param  {Object} options - {method, token, route, external, form}
 * @param  {Object} params
 * @param  {Object} body
 * @param  {Object} headers
 *
 */
function _publicRequest(options, params, body = {}, headers = {}) {
  const cloned = cloneDeep(options);
  if (params) { cloned.route = _parameterizeRoute(cloned.route, params); }
  return _callRequest(cloned, body, headers);
}

/**
 * Call a api request and set Auth header
 * @param  {Object} options - {method, token, route, external, form}
 * @param  {Object} params
 * @param  {Object} body
 * @param  {Object} headers
 * @param  {String} customToken
 *
 */
function _requestWithToken(options, params, body = {}, headers = {}, customToken = null, tokenType = 'Bearer') {
  const cloned = cloneDeep(options);
  if (params) { cloned.route = _parameterizeRoute(cloned.route, params); }
  const requestHeaders = Object.assign({}, headers, {
    Authorization: `${tokenType} ${customToken !== null ? customToken : getToken()}`,
  });
  return _callRequest(cloned, body, requestHeaders);
}

/**
 * Generate a api request
 * @param  {Object} options - {method, token, route, external, form }
 *
 */
export const generateRequest = (options) => {
  const clone = cloneDeep(options);
  clone.token = clone.token || false;
  clone.form = clone.form || false;
  clone.external = clone.external || false;
  if (clone.external) { return _publicRequest.bind(this, clone); }

  return clone.token ? (
    _requestWithToken.bind(this, clone)
  ) : (
    _publicRequest.bind(this, clone)
  );
};

/**
 * Generate a crud api requests
 * @param  {Object} baseUrl
 * @param  {Object} idVar
 * @param  {Object} useToken
 *
 */
export const generateCRUDRequests = (baseUrl = '', idVar = 'id', token = false) => (
  {
    fetchAll: generateRequest({
      token,
      method: 'GET',
      route: baseUrl,
    }),
    create: generateRequest({
      token,
      method: 'POST',
      route: baseUrl,
    }),
    fetchOne: generateRequest({
      token,
      method: 'GET',
      route: `${baseUrl}/:${idVar}`,
    }),
    update: generateRequest({
      token,
      method: 'PUT',
      route: `${baseUrl}/:${idVar}`,
    }),
    delete: generateRequest({
      token,
      method: 'DELETE',
      route: `${baseUrl}/:${idVar}`,
    }),
  }
);


export const request = _request;

export const getReq = request.bind(null, false, 'get');
export const putReq = request.bind(null, false, 'put');
export const postReq = request.bind(null, false, 'post');
export const patchReq = request.bind(null, false, 'patch');
export const deleteReq = request.bind(null, false, 'delete');

export const putFormReq = request.bind(null, true, 'put');
export const postFormReq = request.bind(null, true, 'post');

export const apiRequest = _apiRequest;

export const apiGetReq = apiRequest.bind(null, false, 'get');
export const apiPutReq = apiRequest.bind(null, false, 'put');
export const apiPostReq = apiRequest.bind(null, false, 'post');
export const apiPatchReq = apiRequest.bind(null, false, 'patch');
export const apiDeleteReq = apiRequest.bind(null, false, 'delete');

export const apiPutFormReq = apiRequest.bind(null, true, 'put');
export const apiPostFormReq = apiRequest.bind(null, true, 'post');
