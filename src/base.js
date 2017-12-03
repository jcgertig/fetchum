import { assign } from 'lodash';
import { autobind } from 'core-decorators';
import * as base from './fetchum';
import { Storage } from './storage';
import { setConfig } from './utils';

@autobind
export default class Fetchum {
  constructor(apiBase, storagePrefix, storageType, storageOveride, forceBase = false) {
    this.storageOveride = storageOveride;
    this.forceBase = forceBase;
    this.apiBase = apiBase;

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

  setConfig(apiBase, storagePrefix, storageType, storageOveride, forceBase = false) {
    this.apiBase = apiBase;
    this.forceBase = forceBase;
    this.storageOveride = storageOveride;
    setConfig(apiBase, storagePrefix, storageType);
  }

  getOther(options) {
    if (options.external === true || this.forceBase === false) {
      return {};
    }
    return {
      external: true,
      route: this.apiBase + options.route,
    };
  }

  generateRequest(options) {
    return base.generateRequest(assign(
      { storageOveride: this.LocalStorage },
      options,
      this.getOther(options),
    ));
  }

  generateCRUDRequests(baseUrl, idVar, token) {
    return base.buildCRUDRequests(baseUrl, idVar, token, this.LocalStorage, this.generateRequest);
  }
}
