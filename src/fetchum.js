/* global FormData, fetch, Headers, Request, window, File, Blob */
import es6Promise from 'es6-promise';
import 'fetch-everywhere';
import { cloneDeep, toLower } from 'lodash';
import * as Storage from './storage';
import { parseJson, getBase, transformBody, transformUrlParams, parameterizeRoute } from './utils';

es6Promise.polyfill();

/**
 * Fetchum - Better Fetch
 */

/**
 * Base request call
 * @param  {Boolean} isFormData
 * @param  {String} method
 * @param  {String} url
 * @param  {Object} body
 * @param  {Object} headers
 *
 */
export function request(isFormData, method, url, body = {}, headers = {}, others = {}) {
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
    fetchData.body = transformBody(body, isFormData);
  } else {
    const params = transformUrlParams(body);
    if (params.length > 0) {
      newUrl += `?${params.join('&')}`;
    }
  }

  const reqst = new Request(newUrl, Object.assign({}, others, fetchData));

  const handleRes = (resolve, reject) => (response) => {
    const res = cloneDeep(response);
    try {
      response.text()
        .then((data) => {
          const json = parseJson(data);
          res.data = (json !== null ? json : data);
          if (response.ok) {
            resolve(res);
          } else {
            reject(res);
          }
        })
        .catch(() => {
          res.data = null;
          reject(res);
        });
    } catch (e) {
      reject(response, e);
    }
  };

  return new Promise((resolve, reject) => {
    fetch(reqst)
      .then(handleRes(resolve, reject))
      .catch(handleRes(resolve, reject));
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
export function apiRequest(form, method, route, body, headers, others) {
  const base = getBase();
  if (base === '') {
    return new Promise((done, reject) => reject('No base url set, fullpath needed for node side requests.'));
  }
  return request(form, method, `${base}${route}`, body, headers, others);
}

/**
 * Calls the request and prepends route with base
 * @param  {Object} options = {method, route, form, external, headers}
 * @param  {Object} body
 * @param  {Object} headers
 *
 */
function callRequest(options, body, otherHeaders) {
  const { method, route, form, external, others } = options;
  const headers = Object.assign({}, options.headers, otherHeaders);
  if (external) {
    return request(form, method, route, body, headers, others);
  }
  return apiRequest(form, method, route, body, headers, others);
}

/**
 * Call a api request without a token header
 * @param  {Object} options - {method, token, route, external, form, headers}
 * @param  {Object} params
 * @param  {Object} body
 * @param  {Object} headers
 *
 */
function doPublicRequest(options, params, body = {}, headers = {}) {
  const cloned = cloneDeep(options);
  if (params) { cloned.route = parameterizeRoute(cloned.route, params); }
  return callRequest(cloned, body, headers);
}

/**
 * Call a api request and set Auth header
 * @param  {Object} options - {method, token, route, external, form, headers}
 * @param  {Object} params
 * @param  {Object} body
 * @param  {Object} headers
 * @param  {String} customToken
 *
 */
function requestWithToken(options, params, body = {}, headers = {}, customToken = null, tokenType = 'Bearer') {
  const cloned = cloneDeep(options);
  if (params) { cloned.route = parameterizeRoute(cloned.route, params); }
  const requestHeaders = Object.assign({}, headers, {
    Authorization: `${tokenType} ${customToken !== null ? customToken : Storage.getToken(options.storageOveride)}`,
  });
  return callRequest(cloned, body, requestHeaders);
}

/**
 * Generate a api request
 * @param  {Object} options - {method, token, route, external, form, headers}
 *
 */
export const generateRequest = (options) => {
  const clone = cloneDeep(options);
  clone.token = clone.token || false;
  clone.form = clone.form || false;
  clone.external = clone.external || false;
  clone.headers = clone.headers || {};

  return clone.token ? (
    requestWithToken.bind(this, clone)
  ) : (
    doPublicRequest.bind(this, clone)
  );
};

/**
 * Generate a crud api requests
 * @param  {Object} baseUrl
 * @param  {Object} idVar
 * @param  {Object} useToken
 *
 */
export const generateCRUDRequests = (baseUrl = '', idVar = 'id', token = false, storageOveride) => (
  {
    fetchAll: generateRequest({
      token,
      method: 'GET',
      route: baseUrl,
      storageOveride,
    }),
    create: generateRequest({
      token,
      method: 'POST',
      route: baseUrl,
      storageOveride,
    }),
    fetchOne: generateRequest({
      token,
      method: 'GET',
      route: `${baseUrl}/:${idVar}`,
      storageOveride,
    }),
    update: generateRequest({
      token,
      method: 'PUT',
      route: `${baseUrl}/:${idVar}`,
      storageOveride,
    }),
    delete: generateRequest({
      token,
      method: 'DELETE',
      route: `${baseUrl}/:${idVar}`,
      storageOveride,
    }),
  }
);

const buildReqs = reqMethod => ['get', 'put', 'post', 'patch', 'delete', 'postForm', 'putForm'].reduce(
    (methods, method) => {
      methods[method] = reqMethod.bind(null, method.indexOf('Form') > -1, method); // eslint-disable-line
      return methods;
    },
    {},
  );

export const requests = buildReqs(request);
export const apiRequests = buildReqs(apiRequest);
