'use strict';

exports.__esModule = true;
exports.apiPostFormReq = exports.apiPutFormReq = exports.apiDeleteReq = exports.apiPatchReq = exports.apiPostReq = exports.apiPutReq = exports.apiGetReq = exports.apiRequest = exports.postFormReq = exports.putFormReq = exports.deleteReq = exports.patchReq = exports.postReq = exports.putReq = exports.getReq = exports.request = exports.config = exports.generateCRUDRequests = exports.generateRequest = undefined;

var _lodash = require('lodash');

var _localStorage = require('./localStorage');

/**
 * Fetchum - Better Fetch
 */
/* global FormData, fetch, Headers, Request, window, File, Blob, self */
require('es6-promise').polyfill();
require('isomorphic-fetch');

if (!(0, _lodash.has)(Object, 'assign')) {
  Object.assign = _lodash.assign;
}

function _config(apiBase) {
  if (typeof window !== 'undefined') {
    window.FETCHUM_BASE = apiBase;
  } else {
    process.env.FETCHUM_BASE = apiBase;
  }
}

/**
 * Return the api url base
 *
 */
function _getBase() {
  var base = '';
  if (typeof process === 'object' && '' + process === '[object process]') {
    if (!(0, _lodash.isUndefined)(process.env) && (!(0, _lodash.isUndefined)(process.env.FETCHUM_BASE) || !(0, _lodash.isUndefined)(process.env.API_BASE))) {
      base = process.env.FETCHUM_BASE || process.env.API_BASE;
    }
    return base;
  }
  if (!(0, _lodash.isUndefined)(window.FETCHUM_BASE) || !(0, _lodash.isUndefined)(window.API_BASE)) {
    base = window.FETCHUM_BASE || window.API_BASE;
  }
  return base;
}

/**
 * Check to see if object is json description of file
 * @param  {Object} val
 *
 */
function _isFile(val) {
  return val instanceof File || val instanceof Blob;
}

/**
 * Recursive tranform json to form data
 * @param  {Object} body
 * @param  {Object} formData
 * @param  {String} originalKey
 *
 */
function _transformFormBody(body, formData, originalKey) {
  var data = formData;
  (0, _lodash.forEach)(Object.keys(body), function (paramKey) {
    var obj = body[paramKey];
    var key = !(0, _lodash.isUndefined)(originalKey) ? originalKey + '[' + paramKey + ']' : paramKey;
    if ((0, _lodash.isArray)(obj)) {
      for (var index = 0; index < obj.length; index++) {
        var val = obj[index];
        if ((0, _lodash.isObject)(val) && !_isFile(val) || (0, _lodash.isArray)(val)) {
          data = _transformFormBody(val, data, key + '[' + index + ']');
        } else {
          data.append(key + '[' + index + ']', val);
        }
      }
    } else if ((0, _lodash.isObject)(obj) && !_isFile(obj)) {
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
function _transformBody() {
  var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var isFormData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  if (!isFormData) {
    if ((0, _lodash.isString)(body)) {
      return body;
    }
    return JSON.stringify(body);
  }
  return _transformFormBody(body, new FormData());
}

/**
 * Prep url for request
 * @param  {Object} params
 *
 */
function _transformUrlParams() {
  var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var formatedParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var originalKey = arguments[2];

  var data = formatedParams;
  for (var _iterator = Object.keys(params), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref = _i.value;
    }

    var paramKey = _ref;

    var obj = params[paramKey];
    var key = !(0, _lodash.isUndefined)(originalKey) ? originalKey + '[' + paramKey + ']' : paramKey;
    if ((0, _lodash.isArray)(obj)) {
      for (var index = 0; index < obj.length; index++) {
        var val = obj[index];
        if ((0, _lodash.isObject)(val) || (0, _lodash.isArray)(val)) {
          data = _transformUrlParams(val, data, key + '[' + index + ']');
        } else {
          data.push(key + '[' + index + ']=' + encodeURIComponent(val));
        }
      }
    } else if ((0, _lodash.isObject)(obj)) {
      data = _transformUrlParams(obj, data, key);
    } else {
      data.push(key + '=' + encodeURIComponent(obj));
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
function _request(isFormData, method, url) {
  var body = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var others = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

  var defaultHeaders = {
    Accept: 'application/json'
  };

  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  var newUrl = (0, _lodash.cloneDeep)(url);

  var fetchData = {
    method: (0, _lodash.toLower)(method),
    headers: new Headers(Object.assign({}, defaultHeaders, headers))
  };

  if ((0, _lodash.toLower)(method) !== 'get') {
    fetchData.body = _transformBody(body, isFormData);
  } else {
    var params = _transformUrlParams(body);
    if (params.length > 0) {
      newUrl += '?' + params.join('&');
    }
  }

  var reqst = new Request(newUrl, Object.assign({}, others, fetchData));

  return new Promise(function (resolve, reject) {
    fetch(reqst).then(function (response) {
      try {
        response.text().then(function (data) {
          var json = null;
          try {
            json = JSON.parse(data);
          } catch (e) {
            // test parsing json
          }
          response.data = json !== null ? json : data;
          if (response.ok) {
            return resolve(response);
          }
          reject(response);
        })['catch'](function () {
          response.data = null;return reject(response);
        });
      } catch (e) {
        reject(response, e);
      }
    })['catch'](function (response) {
      try {
        response.text().then(function (data) {
          var json = null;
          try {
            json = JSON.parse(data);
          } catch (e) {
            // test parsing json
          }
          response.data = json !== null ? json : data;
          return reject(response);
        })['catch'](function () {
          response.data = null;return reject(response);
        });
      } catch (e) {
        reject(response, e);
      }
    });
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
  var base = _getBase();
  if (base === '') {
    return new Promise(function (done, reject) {
      return reject('No base url set fullpath needed for node side requests.');
    });
  }
  return _request(form, method, '' + base + route, body, headers, others);
}

/**
 * Calls the request and prepends route with base
 * @param  {Object} options = {method, route, form, external, headers}
 * @param  {Object} body
 * @param  {Object} headers
 *
 */
function _callRequest(options, body, _headers) {
  var method = options.method,
      route = options.route,
      form = options.form,
      external = options.external,
      others = options.others;

  var headers = Object.assign({}, options.headers, _headers);
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
  var parameterized = (0, _lodash.cloneDeep)(route);
  (0, _lodash.forEach)(params, function (val, key) {
    if ((0, _lodash.isUndefined)(val)) {
      console.warn('error: parameter ' + key + ' was ' + val);
    }
    parameterized = parameterized.replace(':' + key, val);
  });
  return parameterized;
}

/**
 * Call a api request without a token header
 * @param  {Object} options - {method, token, route, external, form, headers}
 * @param  {Object} params
 * @param  {Object} body
 * @param  {Object} headers
 *
 */
function _publicRequest(options, params) {
  var body = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var headers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var cloned = (0, _lodash.cloneDeep)(options);
  if (params) {
    cloned.route = _parameterizeRoute(cloned.route, params);
  }
  return _callRequest(cloned, body, headers);
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
function _requestWithToken(options, params) {
  var body = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var headers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var customToken = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  var tokenType = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'Bearer';

  var cloned = (0, _lodash.cloneDeep)(options);
  if (params) {
    cloned.route = _parameterizeRoute(cloned.route, params);
  }
  var requestHeaders = Object.assign({}, headers, {
    Authorization: tokenType + ' ' + (customToken !== null ? customToken : (0, _localStorage.getToken)())
  });
  return _callRequest(cloned, body, requestHeaders);
}

/**
 * Generate a api request
 * @param  {Object} options - {method, token, route, external, form, headers}
 *
 */
var generateRequest = exports.generateRequest = function generateRequest(options) {
  var clone = (0, _lodash.cloneDeep)(options);
  clone.token = clone.token || false;
  clone.form = clone.form || false;
  clone.external = clone.external || false;
  clone.headers = clone.headers || {};

  return clone.token ? _requestWithToken.bind(undefined, clone) : _publicRequest.bind(undefined, clone);
};

/**
 * Generate a crud api requests
 * @param  {Object} baseUrl
 * @param  {Object} idVar
 * @param  {Object} useToken
 *
 */
var generateCRUDRequests = exports.generateCRUDRequests = function generateCRUDRequests() {
  var baseUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var idVar = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'id';
  var token = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  return {
    fetchAll: generateRequest({
      token: token,
      method: 'GET',
      route: baseUrl
    }),
    create: generateRequest({
      token: token,
      method: 'POST',
      route: baseUrl
    }),
    fetchOne: generateRequest({
      token: token,
      method: 'GET',
      route: baseUrl + '/:' + idVar
    }),
    update: generateRequest({
      token: token,
      method: 'PUT',
      route: baseUrl + '/:' + idVar
    }),
    'delete': generateRequest({
      token: token,
      method: 'DELETE',
      route: baseUrl + '/:' + idVar
    })
  };
};

var config = exports.config = _config;

var request = exports.request = _request;

var getReq = exports.getReq = request.bind(null, false, 'get');
var putReq = exports.putReq = request.bind(null, false, 'put');
var postReq = exports.postReq = request.bind(null, false, 'post');
var patchReq = exports.patchReq = request.bind(null, false, 'patch');
var deleteReq = exports.deleteReq = request.bind(null, false, 'delete');

var putFormReq = exports.putFormReq = request.bind(null, true, 'put');
var postFormReq = exports.postFormReq = request.bind(null, true, 'post');

var apiRequest = exports.apiRequest = _apiRequest;

var apiGetReq = exports.apiGetReq = apiRequest.bind(null, false, 'get');
var apiPutReq = exports.apiPutReq = apiRequest.bind(null, false, 'put');
var apiPostReq = exports.apiPostReq = apiRequest.bind(null, false, 'post');
var apiPatchReq = exports.apiPatchReq = apiRequest.bind(null, false, 'patch');
var apiDeleteReq = exports.apiDeleteReq = apiRequest.bind(null, false, 'delete');

var apiPutFormReq = exports.apiPutFormReq = apiRequest.bind(null, true, 'put');
var apiPostFormReq = exports.apiPostFormReq = apiRequest.bind(null, true, 'post');