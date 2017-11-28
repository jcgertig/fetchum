/* eslint-disable import/no-named-as-default-member */
/* global test, expect */
import fetchumNode from './node';

test('test store setToken and getToken', () => {
  fetchumNode.LocalStorage.setToken('test-return');
  expect(fetchumNode.LocalStorage.getToken()).toBe('test-return');
});

test('test store length', () => {
  expect(fetchumNode.LocalStorage.store().getLength()).toBe(8);
});
