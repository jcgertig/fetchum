# Fetchum
 A better fetch api and LocalStorage Wrapper


## Setup

```
<script>
  window.API_BASE = 'localhost:3000/api';
  window.STORAGE_PREFIX = '@my-app';
</script>
```

## Usage

```
import fetchum from 'fetchum';

const getUsersDirect = () => {
  fetchum.apiGet('/v1/users')
    .then((res) => { console.log('my users', res); })
    .catch((res) => { console.warn(res); });
};

const getMyUsers = fetchum.generateRequest({
  method: 'GET',
  token: false,
  route: '/v1/users',
});

const getUsersIndirect = () => {
  getMyUsers()
    .then((res) => { console.log('my users', res); })
    .catch((res) => { console.warn(res); });
};
```

```
import {generateRequest} from 'fetchum';

const getRandomUser = generateRequest({
  method: 'GET',
  external: true,
  route: 'http://uifaces.com/api/v1/random',
});
```
