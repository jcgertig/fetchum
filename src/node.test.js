/* eslint-disable import/no-named-as-default-member */
/* global test, expect */
import fetchumNode from './node';

test('test store setToken and getToken', (done) => {
  fetchumNode.LocalStorage.setToken('test-return');
  fetchumNode.LocalStorage.getToken().then((token) => {
    expect(token).toBe('test-return');
    done();
  });
});

test('test store length', (done) => {
  fetchumNode.LocalStorage.store().getLength()
  .then(len => {
    expect(len).toBe(8);
    done();
  });
});
