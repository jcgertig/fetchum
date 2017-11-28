import FetchumBase from './base';

export * from './fetchum';
export LocalStorage from './storage';
export { setConfig } from './utils';
export const Fetchum = FetchumBase;

export default new FetchumBase();
