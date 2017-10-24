(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'lodash', './storage', './utils', 'isomorphic-fetch'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('lodash'), require('./storage'), require('./utils'), require('isomorphic-fetch'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.lodash, global.storage, global.utils, global.isomorphicFetch);
    global.index = mod.exports;
  }
})(this, function (exports, _lodash, _storage, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var Storage = _interopRequireWildcard(_storage);

  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};

      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
        }
      }

      newObj.default = obj;
      return newObj;
    }
  }

  /* global FormData, fetch, Headers, Request, window, File, Blob, self */
  var methods = {
    setConfig: _utils.setConfig,
    Storage: Storage
  };

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
  function request(isFormData, method, url) {
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
      fetchData.body = (0, _utils.transformBody)(body, isFormData);
    } else {
      var params = (0, _utils.transformUrlParams)(body);
      if (params.length > 0) {
        newUrl += '?' + params.join('&');
      }
    }

    var reqst = new Request(newUrl, Object.assign({}, others, fetchData));

    var handleRes = function handleRes(resolve, reject) {
      return function (response) {
        var res = (0, _lodash.cloneDeep)(response);
        try {
          response.text().then(function (data) {
            var json = (0, _utils.parseJson)(data);
            res.data = json !== null ? json : data;
            if (response.ok) {
              resolve(res);
            } else {
              reject(res);
            }
          }).catch(function () {
            res.data = null;
            reject(res);
          });
        } catch (e) {
          reject(response, e);
        }
      };
    };

    return new Promise(function (resolve, reject) {
      fetch(reqst).then(handleRes(resolve, reject)).catch(handleRes(resolve, reject));
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
  function apiRequest(form, method, route, body, headers, others) {
    var base = (0, _utils.getBase)();
    if (base === '') {
      return new Promise(function (done, reject) {
        return reject('No base url set, fullpath needed for node side requests.');
      });
    }
    return request(form, method, '' + base + route, body, headers, others);
  }

  /**
   * Calls the request and prepends route with base
   * @param  {Object} options = {method, route, form, external, headers}
   * @param  {Object} body
   * @param  {Object} headers
   *
   */
  function callRequest(options, body, otherHeaders) {
    var method = options.method,
        route = options.route,
        form = options.form,
        external = options.external,
        others = options.others;

    var headers = Object.assign({}, options.headers, otherHeaders);
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
  function doPublicRequest(options, params) {
    var body = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var headers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    var cloned = (0, _lodash.cloneDeep)(options);
    if (params) {
      cloned.route = (0, _utils.parameterizeRoute)(cloned.route, params);
    }
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
  function requestWithToken(options, params) {
    var body = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var headers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var customToken = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    var tokenType = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'Bearer';

    var cloned = (0, _lodash.cloneDeep)(options);
    if (params) {
      cloned.route = (0, _utils.parameterizeRoute)(cloned.route, params);
    }
    var requestHeaders = Object.assign({}, headers, {
      Authorization: tokenType + ' ' + (customToken !== null ? customToken : Storage.getToken())
    });
    return callRequest(cloned, body, requestHeaders);
  }

  /**
   * Generate a api request
   * @param  {Object} options - {method, token, route, external, form, headers}
   *
   */
  var generateRequest = function generateRequest(options) {
    var clone = (0, _lodash.cloneDeep)(options);
    clone.token = clone.token || false;
    clone.form = clone.form || false;
    clone.external = clone.external || false;
    clone.headers = clone.headers || {};

    return clone.token ? requestWithToken.bind(undefined, clone) : doPublicRequest.bind(undefined, clone);
  };

  /**
   * Generate a crud api requests
   * @param  {Object} baseUrl
   * @param  {Object} idVar
   * @param  {Object} useToken
   *
   */
  var generateCRUDRequests = function generateCRUDRequests() {
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
      delete: generateRequest({
        token: token,
        method: 'DELETE',
        route: baseUrl + '/:' + idVar
      })
    };
  };

  methods.request = request;
  methods.apiRequest = apiRequest;
  methods.generateRequest = generateRequest;
  methods.generateCRUDRequests = generateCRUDRequests;

  var buildReqs = function buildReqs() {
    var mid = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var form = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    ['get', 'put', 'post', 'patch', 'delete'].forEach(function (method) {
      methods['' + method + mid + 'Request'] = request.bind(null, form, method);
    });
  };

  buildReqs();
  buildReqs('Form', true);
  buildReqs('Api');
  buildReqs('ApiForm', true);

  exports.default = methods;
});