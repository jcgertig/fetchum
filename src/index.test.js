/* eslint-disable import/no-named-as-default-member */
/* global test, expect */
import BetterStorage from 'betterstorage';
import fetchum from './index';

test('test store override getToken', () => {
  const store = new BetterStorage('@test', {
    setItem: () => {},
    getItem: () => ({ token: 'test-return' }),
    removeItem: () => {},
    key: () => {},
    clear: () => {},
    length: 0,
  });
  expect(fetchum.LocalStorage.getToken(store)).toBe('test-return');
});
