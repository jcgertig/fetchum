# Fetchum
 A better fetch api and LocalStorage Wrapper


## Setup

```
<script>
  window.API_BASE = 'localhost:3000/api';
  window.STORAGE_PREFIX = '@my-app';
</script>
```

## Api request - methods

```
/**
 * Generate a api request
 * @param  {Object} options - {method, token, route, external, form }
 *
 */
generateRequest

/**
 * Base request call
 * @param  {Boolean} isFormData
 * @param  {String} method
 * @param  {String} url
 * @param  {JSON} body
 * @param  {Object} headers
 * @param  {String} credentials
 *
 */
 request

/**
 * Basic http requests
 * @param  {String} url
 * @param  {JSON} body
 * @param  {Object} headers
 * @param  {String} credentials
 *
 */
getReq, putReq, postReq, patchReq, deleteReq

/**
 * Form requests - the body JSON is converted into FormData
 * @param  {String} url
 * @param  {JSON} body
 * @param  {Object} headers
 * @param  {String} credentials
 *
 */
putFormReq, postFormReq

/**
 * Calls the request and prepends route with api base
 * @param  {Boolean} isFormData
 * @param  {String} method
 * @param  {String} url
 * @param  {JSON} body
 * @param  {Object} headers
 * @param  {String} credentials
 *
 */
apiRequest

/**
 * Basic http requests that prepend route with api base
 * @param  {String} url
 * @param  {JSON} body
 * @param  {Object} headers
 * @param  {String} credentials
 *
 */
apiGetReq, apiPutReq, apiPostReq, apiPatchReq, apiDeleteReq

/**
 * API Form requests - the body JSON is converted into FormData
 * @param  {String} url
 * @param  {JSON} body
 * @param  {Object} headers
 * @param  {String} credentials
 *
 */
apiPutFormReq, apiPostFormReq

```

### Api - `generateRequest`

`generateRequest` returns a function to call that will make a request
based on set options.

__Options__
 - `method` : http verb
 - `route` : url string
 - `form` : boolean if submit as form data (default: false)
 - `token` : boolean if set Auth header from local storage token (default: false)
 - `external` : boolean if should not prepend route with api base (default: false)

__Function Params__
 - `params` : json object matching keys for parameterized routes ie: `/user/:id`
 - `body` : json request body/url params
 - `headers` : json request headers
 - `customToken` : !Only if external option is `false`

__Examples__
```
import {generateRequest} from 'fetchum';

const getRandomUser = generateRequest({
  method: 'GET',
  external: true,
  route: 'http://uifaces.com/api/v1/random',
});
```

Create and update a user with profile image on a authenticated api
```
import {generateRequest} from 'fetchum';

const postUser = generateRequest({
  method: 'POST',
  form: true,
  token: true,
  route: '/v1/user',
});

const putUser = generateRequest({
  method: 'PUT',
  form: true,
  token: true,
  route: '/v1/user/:id',
});

const createUser = (data) => {
  postUser({}, data)
    .then((res) => { console.log('created', res); })
    .catch((res) => { console.warn(res); });
};

const updateUser = (id, data) => {
  putUser({id}, data)
    .then((res) => { console.log('updated', res); })
    .catch((res) => { console.warn(res); });
};
```

### Api - `localStorage`
Fetchum has a build in LocalStorage wrapper for convenience and for the
specific use of getting the auth token.

To use the `token` option in the `generateRequest` call you will need to use
this `localStorage` wrapper;

__Examples__
```
import {localStorage} from 'fetchum';

const setToken = (token) => {
  localStorage.set('token', token);
};
```

Login and out example
```
import {localStorage, generateRequest} from 'fetchum';

const apiLogin = generateRequest({
  method: 'POST',
  route: '/v1/login',
});

const login = (data) => {
  apiLogin(data)
    .then((res) => {
      localStorage.setToken(res.token);
      localStorage.set('user', res.user);
    })
    .catch((res) => { console.warn(res); });
};

const getCurrentUser = () => {
  return localStorage.get('user');
};

const logout = () => {
  localStorage.remove('user');
  localStorage.removeToken();
};
```

### Random Usage Examples
```
import {generateRequest} from 'fetchum';

/**
 * API Calls
 *
 */
export default {
  login: generateRequest({
    method: 'POST',
    route: '/v1/login',
  }),
  user: {
    getAll: generateRequest({
      method: 'GET',
      token: true,
      route: '/v1/users',
    }),
    show: generateRequest({
      method: 'GET',
      token: true,
      route: '/v1/users/:id',
    }),
    update: generateRequest({
      method: 'PUT',
      token: true,
      route: '/v1/users/:id',
    }),
    remove: generateRequest({
      method: 'DELETE',
      token: true,
      route: '/v1/users/:id',
    }),
    create: generateRequest({
      method: 'POST',
      token: true,
      route: '/v1/users',
    }),
  }
};

```


```
import fetchum from 'fetchum';

const getUsersDirect = () => {
  fetchum.apiGet('/v1/users')
    .then((res) => { console.log('my users', res); })
    .catch((res) => { console.warn(res); });
};
```
