import { assign } from 'lodash';
import { autobind } from 'core-decorators';
import * as base from './fetchum';
import { Storage } from './storage';
import { setConfig } from './utils';

@autobind
export default class Fetchum {
  constructor(apiBase, storagePrefix, storageType, storageOveride) {
    this.storageOveride = storageOveride;

    setConfig(apiBase, storagePrefix, storageType);
  }

  get requests() { // eslint-disable-line class-methods-use-this
    return base.requests;
  }

  get apiRequests() { // eslint-disable-line class-methods-use-this
    return base.apiRequests;
  }

  get LocalStorage() {
    return new Storage(this.storageOveride);
  }

  setConfig(apiBase, storagePrefix, storageType) { // eslint-disable-line class-methods-use-this
    setConfig(apiBase, storagePrefix, storageType);
  }

  generateRequest(options) {
    return base.generateRequest(assign({ storageOveride: this.LocalStorage }, options));
  }

  generateCRUDRequests(baseUrl, idVar, token) {
    return base.generateCRUDRequests(baseUrl, idVar, token, this.LocalStorage);
  }
}
