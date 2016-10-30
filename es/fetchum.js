var _this = this;

/* global FormData, fetch, Headers, Request, window, File, Blob */
import { forEach, cloneDeep, isArray, isObject, toLower, isUndefined, has, assign } from 'lodash';
import { getToken } from './localStorage';

/**
 * Fetchum - Better Fetch
 */
require('es6-promise').polyfill();

if (!has(Object, 'assign')) {
  Object.assign = assign;
}

/**
 * Return the api url base
 *
 */
function _getBase() {
  var base = '';
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
  forEach(Object.keys(body), function (paramKey) {
    var obj = body[paramKey];
    var key = !isUndefined(originalKey) ? originalKey + '[' + paramKey + ']' : paramKey;
    if (isArray(obj)) {
      for (var index = 0; index < obj.length; index++) {
        var val = obj[index];
        if (isObject(val) && !_isFile(val) || isArray(val)) {
          data = _transformFormBody(val, data, key + '[' + index + ']');
        } else {
          data.append(key + '[' + index + ']', val);
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
function _transformBody() {
  var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var isFormData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  if (!isFormData) {
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
    var key = !isUndefined(originalKey) ? originalKey + '[' + paramKey + ']' : paramKey;
    if (isArray(obj)) {
      for (var index = 0; index < obj.length; index++) {
        var val = obj[index];
        if (isObject(val) || isArray(val)) {
          data = _transformUrlParams(val, data, key + '[' + index + ']');
        } else {
          data.push(key + '[' + index + ']=' + encodeURIComponent(val));
        }
      }
    } else if (isObject(obj)) {
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

  console.log('REQUEST', fetch, Headers);
  var defaultHeaders = {
    Accept: 'application/json'
  };

  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  var newUrl = cloneDeep(url);

  var fetchData = {
    method: toLower(method),
    headers: new Headers(Object.assign({}, defaultHeaders, headers))
  };

  if (toLower(method) !== 'get') {
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
      if (response.ok) {
        response.text().then(function (data) {
          var json = null;
          try {
            json = JSON.parse(data);
          } catch (e) {
            // test parsing json
          }
          response.data = json !== null ? json : data;
          return resolve(response);
        })['catch'](function () {
          return reject(response);
        });
      } else {
        reject(response);
      }
    })['catch'](function (response) {
      return reject(response);
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
  return _request(form, method, '' + _getBase() + route, body, headers, others);
}

/**
 * Calls the request and prepends route with base
 * @param  {Object} options = {method, route, form, external}
 * @param  {Object} body
 * @param  {Object} headers
 *
 */
function _callRequest(_ref2, body, headers) {
  var method = _ref2.method,
      route = _ref2.route,
      form = _ref2.form,
      external = _ref2.external,
      others = _ref2.others;

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
  var parameterized = cloneDeep(route);
  forEach(params, function (val, key) {
    if (isUndefined(val)) {
      console.warn('error: parameter ' + key + ' was ' + val);
    }
    parameterized = parameterized.replace(':' + key, val);
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
function _publicRequest(options, params) {
  var body = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var headers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var cloned = cloneDeep(options);
  if (params) {
    cloned.route = _parameterizeRoute(cloned.route, params);
  }
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
function _requestWithToken(options, params) {
  var body = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var headers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var customToken = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  var tokenType = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'Bearer';

  var cloned = cloneDeep(options);
  if (params) {
    cloned.route = _parameterizeRoute(cloned.route, params);
  }
  var requestHeaders = Object.assign({}, headers, {
    Authorization: tokenType + ' ' + (customToken !== null ? customToken : getToken())
  });
  return _callRequest(cloned, body, requestHeaders);
}

/**
 * Generate a api request
 * @param  {Object} options - {method, token, route, external, form }
 *
 */
export var generateRequest = function generateRequest(options) {
  var clone = cloneDeep(options);
  clone.token = clone.token || false;
  clone.form = clone.form || false;
  clone.external = clone.external || false;
  if (clone.external) {
    return _publicRequest.bind(_this, clone);
  }

  return clone.token ? _requestWithToken.bind(_this, clone) : _publicRequest.bind(_this, clone);
};

/**
 * Generate a crud api requests
 * @param  {Object} baseUrl
 * @param  {Object} idVar
 * @param  {Object} useToken
 *
 */
export var generateCRUDRequests = function generateCRUDRequests() {
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

export var request = _request;

export var getReq = request.bind(null, false, 'get');
export var putReq = request.bind(null, false, 'put');
export var postReq = request.bind(null, false, 'post');
export var patchReq = request.bind(null, false, 'patch');
export var deleteReq = request.bind(null, false, 'delete');

export var putFormReq = request.bind(null, true, 'put');
export var postFormReq = request.bind(null, true, 'post');

export var apiRequest = _apiRequest;

export var apiGetReq = apiRequest.bind(null, false, 'get');
export var apiPutReq = apiRequest.bind(null, false, 'put');
export var apiPostReq = apiRequest.bind(null, false, 'post');
export var apiPatchReq = apiRequest.bind(null, false, 'patch');
export var apiDeleteReq = apiRequest.bind(null, false, 'delete');

export var apiPutFormReq = apiRequest.bind(null, true, 'put');
export var apiPostFormReq = apiRequest.bind(null, true, 'post');