// Polyfill for crypto.randomUUID() required by TypeORM
import { webcrypto } from 'crypto';

if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = webcrypto as any;
}

