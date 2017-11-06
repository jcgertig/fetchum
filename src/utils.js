import { isArray, isObject, isString, isUndefined, cloneDeep, forEach } from 'lodash';

export function parseJson(data) {
  let json = null;
  try {
    json = JSON.parse(data);
  } catch (e) {
    // test parsing json
  }
  return json;
}

export function setConfig(apiBase) {
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
export function getBase() {
  let base = '';
  if (typeof process === 'object' && `${process}` === '[object process]') {
    if (
      !isUndefined(process.env) &&
      (!isUndefined(process.env.FETCHUM_BASE) || !isUndefined(process.env.API_BASE))
    ) {
      base = process.env.FETCHUM_BASE || process.env.API_BASE;
    }
    return base;
  }
  if (!isUndefined(window.FETCHUM_BASE) || !isUndefined(window.API_BASE)) {
    base = window.FETCHUM_BASE || window.API_BASE;
  }
  return base;
}

/**
 * Check to see if object is json description of file
 * @param  {Object} val
 *
 */
export function isFile(val) {
  return (val instanceof File || val instanceof Blob);
}

/**
 * Recursive tranform json to form data
 * @param  {Object} body
 * @param  {Object} formData
 * @param  {String} originalKey
 *
 */
export function transformFormBody(body, formData, originalKey) {
  let data = formData;
  Object.keys(body).forEach((paramKey) => {
    const obj = body[paramKey];
    const key = !isUndefined(originalKey) ? `${originalKey}[${paramKey}]` : paramKey;
    if (isArray(obj)) {
      for (let index = 0; index < obj.length; index += 1) {
        const val = obj[index];
        if ((isObject(val) && !isFile(val)) || isArray(val)) {
          data = transformFormBody(val, data, `${key}[${index}]`);
        } else {
          data.append(`${key}[${index}]`, val);
        }
      }
    } else if (isObject(obj) && !isFile(obj)) {
      data = transformFormBody(obj, data, key);
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
export function transformBody(body = {}, isFormData = false) {
  if (!isFormData) {
    if (isString(body)) { return body; }
    return JSON.stringify(body);
  }
  return transformFormBody(body, new FormData());
}

/**
 * Prep url for request
 * @param  {Object} params
 *
 */
export function transformUrlParams(params = {}, formatedParams = [], originalKey) {
  let data = formatedParams;
  Object.keys(params).forEach((paramKey) => {
    const obj = params[paramKey];
    const key = !isUndefined(originalKey) ? `${originalKey}[${paramKey}]` : paramKey;
    if (isArray(obj)) {
      obj.forEach((val, index) => {
        if (isObject(val) || isArray(val)) {
          data = transformUrlParams(val, data, `${key}[${index}]`);
        } else {
          data.push(`${key}[${index}]=${encodeURIComponent(val)}`);
        }
      });
    } else if (isObject(obj)) {
      data = transformUrlParams(obj, data, key);
    } else {
      data.push(`${key}=${encodeURIComponent(obj)}`);
    }
  });
  return data;
}

/**
 * Replace keys in string format :key with value in params
 * @param  {String} route
 * @param  {Object} params
 *
 */
export function parameterizeRoute(route, params) {
  let parameterized = cloneDeep(route);
  forEach(params, (val, key) => {
    // eslint-disable-next-line
    if (isUndefined(val)) { console.warn(`error: parameter ${key} was ${val}`); }
    parameterized = parameterized.replace(`:${key}`, val);
  });
  return parameterized;
}
