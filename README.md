# Fetchum

[![Downloads][npm-dm]][package-url]
[![Downloads][npm-dt]][package-url]
[![NPM Version][npm-v]][package-url]
[![Dependencies][deps]][package-url]
[![Dev Dependencies][dev-deps]][package-url]
[![License][license]][package-url]

__A better fetch api__

> The main bulk of the local storage wrapper has been moved out into [betterstorage](https://github.com/jcgertig/betterstorage).
The token related methods still exist but are now promise based.

## Install

```bash
npm i -S fetchum

yarn add fetchum
```

## Setup

```javascript
<script>
  window.FETCHUM_BASE = 'localhost:3000/api';
  window.FETCHUM_PREFIX = '@my-app';
</script>
```

For use Node side set `env` vars ie:

```javascript
process.env.FETCHUM_BASE = 'localhost:3000/api';
process.env.FETCHUM_PREFIX = '@my-app';
```

For universal set both.

```javascript
import fetchum from 'fetchum';

fetchum.setConfig('/api/', '@app-prefix');
```

### Api - `generateRequest`

`generateRequest` returns a function to call that will make a request
based on set options.

__Options__
 - `method` : http verb
 - `route` : url string
 - `headers` : object for default request headers (default: {})
 - `form` : boolean if submit as form data (default: false)
 - `token` : boolean if set Auth header from local storage token (default: false)
 - `external` : boolean if should not prepend route with api base (default: false)

__Function Params__
 - `params` : json object matching keys for parameterized routes ie: `/user/:id`
 - `body` : json request body/url params
 - `headers` : json request headers
 - `customToken` : !Only if external option is `false`
 - `tokenType` : !Only if external option is `false`. Default `Bearer`.

__Examples__

```javascript
import fetchum from 'fetchum';

const getRandomUser = fetchum.generateRequest({
  method: 'GET',
  external: true,
  route: 'http://uifaces.com/api/v1/random',
});
```

Create and update a user with profile image on a authenticated api
```javascript
import fetchum from 'fetchum';

const postUser = fetchum.generateRequest({
  method: 'POST',
  form: true,
  token: true,
  route: '/v1/user',
});

const putUser = fetchum.generateRequest({
  method: 'PUT',
  form: true,
  token: true,
  route: '/v1/user/:id',
});

const createUser = (data) => {
  postUser({}, data)
    .then((res) => { console.log('created', res.data); })
    .catch((res) => { console.warn(res); });
};

const updateUser = (id, data) => {
  putUser({id}, data)
    .then((res) => { console.log('updated', res.data); })
    .catch((res) => { console.warn(res); });
};
```

### Api - `generateCRUDRequests`

Like `generateRequest` `generateCRUDRequests` will generate request structure but it does more returning a object with all the basic crud actions.

__Function Params__
 - `baseUrl` : url string to base crud actions off ie: `/user`
 - `idVar` : the var name of the `id` url param id the `:id` in `/user/:id`. The `:` should not be passed.
  - __Defualt__ - `'id'`
 - `useToken` : if the routes should have the token option set.
  - __Defualt__ - `false`

__Examples__
```javascript
import fetchum from 'fetchum';

const userApi = fetchum.generateCRUDRequests('/users', 'id', true);

userApi.fetchOne({ id: 0 })
  .then((res) => {
    this.user = res.data.user;
  });
```

__Returned Requests__

- `fetchAll` - `GET` to base url
- `create` - `POST` to base url
- `fetchOne` - `GET` to base url and added id Var ie: `/users/:id`
- `update` - `PUT` to base url and added id Var ie: `/users/:id`
- `delete` - `DELETE` to base url and added id Var ie: `/users/:id`


### Api - `LocalStorage`
Fetchum has a build in LocalStorage wrapper for convenience and for the
specific use of getting the auth token.

To use the `token` option in the `generateRequest` call you will need to use
this `LocalStorage` wrapper;

__Methods__
- `set` - sets var in storage ie `LocalStorage.set('varName', varValue)`
- `get` - gets a var value from storage ie: `const varValue = LocalStorage.set('varName')`
- `remove` - removes a var from storage
- `isSet` - returns boolean for if a var is in storage
- `setToken` - sets a token in storage used by requests
- `getToken` - gets a token from storage
- `removeToken` - removes a token from storage

__Examples__
```javascript
import {LocalStorage} from 'fetchum';

const setToken = (token) => {
  LocalStorage.set('token', token);
};
```

Login and out example
```javascript
import fetchum from 'fetchum';

const apiLogin = fetchum.generateRequest({
  method: 'POST',
  route: '/v1/login',
});

const login = (data) => {
  apiLogin(data)
    .then((res) => {
      fetchum.LocalStorage.setToken(res.data.token);
      fetchum.LocalStorage.set('user', res.data.user);
    })
    .catch((res) => { console.warn(res); });
};

const getCurrentUser = () => {
  return fetchum.LocalStorage.get('user');
};

const logout = () => {
  fetchum.LocalStorage.remove('user');
  fetchum.LocalStorage.removeToken();
};
```

### Random Usage Examples
```javascript
import fetchum from 'fetchum';

/**
 * API Calls
 *
 */
export default {
  login: fetchum.generateRequest({
    method: 'POST',
    route: '/v1/login',
  }),
  user: {
    getAll: fetchum.generateRequest({
      method: 'GET',
      token: true,
      route: '/v1/users',
    }),
    show: fetchum.generateRequest({
      method: 'GET',
      token: true,
      route: '/v1/users/:id',
    }),
    update: fetchum.generateRequest({
      method: 'PUT',
      token: true,
      route: '/v1/users/:id',
    }),
    remove: fetchum.generateRequest({
      method: 'DELETE',
      token: true,
      route: '/v1/users/:id',
    }),
    create: fetchum.generateRequest({
      method: 'POST',
      token: true,
      route: '/v1/users',
    }),
  }
};

```


```javascript
import { apiRequests } from 'fetchum';

const getUsersDirect = () => {
  apiRequests.get('/v1/users')
    .then((res) => { console.log('my users', res.data); })
    .catch((res, err) => { console.warn(res); });
};
```

## Api request - methods

```javascript
/**
 * Generate a api request
 * @param  {Object} options - {method, token, route, external, form, headers}
 *
 */
generateRequest

/**
 * Generate a crud api requests
 * @param  {Object} baseUrl
 * @param  {Object} idVar
 * @param  {Object} useToken
 *
 */
generateCRUDRequests

/**
 * Base request call
 * @param  {Boolean} isFormData
 * @param  {String} method
 * @param  {String} url
 * @param  {JSON} body
 * @param  {Object} headers
 * @param  {Object} otherConfig
 *
 */
request

/**
 * Basic http requests
 * @param  {String} url
 * @param  {JSON} body
 * @param  {Object} headers
 * @param  {Object} otherConfig
 *
 */
requests.get, requests.put, requests.post, requests.patch, requests.delete

/**
 * Form requests - the body JSON is converted into FormData
 * @param  {String} url
 * @param  {JSON} body
 * @param  {Object} headers
 * @param  {Object} otherConfig
 *
 */
requests.putForm, requests.postForm

/**
 * Calls the request and prepends route with api base
 * @param  {Boolean} isFormData
 * @param  {String} method
 * @param  {String} url
 * @param  {JSON} body
 * @param  {Object} headers
 * @param  {Object} otherConfig
 *
 */
apiRequest

/**
 * Basic http requests that prepend route with api base
 * @param  {String} url
 * @param  {JSON} body
 * @param  {Object} headers
 * @param  {Object} otherConfig
 *
 */
apiRequests.get, apiRequests.put, apiRequests.post, apiRequests.patch, apiRequests.delete

/**
 * API Form requests - the body JSON is converted into FormData
 * @param  {String} url
 * @param  {JSON} body
 * @param  {Object} headers
 * @param  {Object} otherConfig
 *
 */
apiRequests.putForm, apiRequests.postForm

```

[npm-dm]: https://img.shields.io/npm/dm/fetchum.svg
[npm-dt]: https://img.shields.io/npm/dt/fetchum.svg
[npm-v]: https://img.shields.io/npm/v/fetchum.svg
[deps]: https://img.shields.io/david/jcgertig/fetchum.svg
[dev-deps]: https://img.shields.io/david/dev/jcgertig/fetchum.svg
[license]: https://img.shields.io/npm/l/fetchum.svg
[package-url]: https://npmjs.com/package/fetchum
