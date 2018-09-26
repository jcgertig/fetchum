/* eslint-disable import/no-named-as-default-member */
/* global test, expect */
import BetterStorage from 'betterstorage';
import fetchum from './index';

test('test store override getToken', (done) => {
  const store = new BetterStorage('@test', {
    setItem: () => {},
    getItem: () => ({ token: 'test-return' }),
    removeItem: () => {},
    key: () => {},
    clear: () => {},
    length: 0,
  });
  fetchum.LocalStorage.getToken(store).then(token => {
    expect(token).toBe('test-return');
    done();
  });
});
