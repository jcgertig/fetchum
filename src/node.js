import { LocalStorage as NodeStorage } from 'node-localstorage';
import FetchumBase from './base';
import { Storage } from './storage';

const localStorage = new NodeStorage('./fetchum-storage');

export * from './fetchum';
export { setConfig } from './utils';
export const Fetchum = FetchumBase;
export const LocalStorage = new Storage(localStorage);

export default new FetchumBase(undefined, undefined, undefined, localStorage);
