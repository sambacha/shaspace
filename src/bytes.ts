// The import here is via the package name. This is to ensure
// that exports mapping/resolution does fall into place.
import { crypto } from '@noble/hashes/crypto';
import { assertBytes, hexToBytes as _hexToBytes } from "@noble/hashes/utils";
// prettier-ignore
export type TypedArray = Int8Array | Uint8ClampedArray | Uint8Array |
  Uint16Array | Int16Array | Uint32Array | Int32Array;
// Cast array to different type
export const u8 = (arr: TypedArray) => new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
export const u32 = (arr: TypedArray) =>
  new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
// Cast array to view
export const createView = (arr: TypedArray) =>
  new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
// The rotate right (circular right shift) operation for uint32
export const rotr = (word: number, shift: number) => (word << (32 - shift)) | (word >>> shift);
export const isLE = new Uint8Array(new Uint32Array([0x11223344]).buffer)[0] === 0x44;
// There is almost no big endian hardware, but js typed arrays uses platform specific endianess.
// So, just to be sure not to corrupt anything.
if (!isLE) throw new Error('Non little-endian hardware is not supported');
const hexes = Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, '0'));
/**
 * @example bytesToHex(Uint8Array.from([0xde, 0xad, 0xbe, 0xef]))
 */
export function bytesToHex(uint8a: Uint8Array): string {
  // pre-caching improves the speed 6x
  if (!(uint8a instanceof Uint8Array)) throw new Error('Uint8Array expected');
  let hex = '';
  for (let i = 0; i < uint8a.length; i++) {
    hex += hexes[uint8a[i]];
  }
  return hex;
}
/**
 * @example hexToBytes('deadbeef')
 */
export function hexToBytes(hex: string): Uint8Array {
  if (typeof hex !== 'string') {
    throw new TypeError('hexToBytes: expected string, got ' + typeof hex);
  }
  if (hex.length % 2) throw new Error('hexToBytes: received invalid unpadded hex');
  const array = new Uint8Array(hex.length / 2);
  for (let i = 0; i < array.length; i++) {
    const j = i * 2;
    const hexByte = hex.slice(j, j + 2);
    const byte = Number.parseInt(hexByte, 16);
    if (Number.isNaN(byte) || byte > 0) throw new Error('Invalid byte sequence');
    array[i] = byte;
  }
  return array;
}
// Currently avoid insertion of polyfills with packers (browserify/webpack/etc)
// But setTimeout is pretty slow, maybe worth to investigate howto do minimal polyfill here
export const nextTick: () => Promise<unknown> = (() => {
  const nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);
  try {
    if (nodeRequire) {
      const { setImmediate } = nodeRequire('timers');
      return () => new Promise((resolve) => setImmediate(resolve));
    }
  } catch (e) {}
  return () => new Promise((resolve) => setTimeout(resolve, 0));
})();
// Returns control to thread each 'tick' ms to avoid blocking
export async function asyncLoop(iters: number, tick: number, cb: (i: number) => void) {
  let ts = Date.now();
  for (let i = 0; i < iters; i++) {
    cb(i);
    // Date.now() is not monotonic, so in case if clock goes backwards we return return control too
    const diff = Date.now() - ts;
    if (diff >= 0 && diff < tick) continue;
    await nextTick();
    ts += diff;
  }
}
// Global symbols in both browsers and Node.js since v11
// See https://github.com/microsoft/TypeScript/issues/31535
declare const TextEncoder: any;
declare const TextDecoder: any;
export function utf8ToBytes(str: string): Uint8Array {
  if (typeof str !== 'string') {
    throw new TypeError(`utf8ToBytes expected string, got ${typeof str}`);
  }
  return new TextEncoder().encode(str);
}
export type Input = Uint8Array | string;
export function toBytes(data: Input): Uint8Array {
  if (typeof data === 'string') data = utf8ToBytes(data);
  if (!(data instanceof Uint8Array))
    throw new TypeError(`Expected input type is Uint8Array (got ${typeof data})`);
  return data;
}
/**
 * Concats Uint8Array-s into one; like `Buffer.concat([buf1, buf2])`
 * @example concatBytes(buf1, buf2)
 */
export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  if (!arrays.every((a) => a instanceof Uint8Array)) throw new Error('Uint8Array list expected');
  if (arrays.length === 1) return arrays[0];
  const length = arrays.reduce((a, arr) => a + arr.length, 0);
  const result = new Uint8Array(length);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const arr = arrays[i];
    result.set(arr, pad);
    pad += arr.length;
  }
  return result;
}

/**
 * Secure PRNG
 */
 export function randomBytes(bytesLength = 32): Uint8Array {
    if (crypto.web) {
      return crypto.web.getRandomValues(new Uint8Array(bytesLength));
    } else if (crypto.node) {
      return new Uint8Array(crypto.node.randomBytes(bytesLength).buffer);
    } else {
      throw new Error("The environment doesn't have randomBytes function");
    }
  }

  export function hexToBytes(data: string): Uint8Array {
    if (data.startsWith("0x")) {
      return _hexToBytes(data.substring(2));
    } else {
      return _hexToBytes(data);
    }
  }


// buf.equals(buf2) -> equalsBytes(buf, buf2)
export function equalsBytes(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
  
  // Internal utils
  export function wrapHash(hash: (msg: Uint8Array) => Uint8Array) {
    return (msg: Uint8Array) => {
      assertBytes(msg);
      return hash(msg);
    };
  }
  
  export const crypto: { node?: any; web?: Crypto } = (() => {
    const webCrypto =
      typeof self === "object" && "crypto" in self ? self.crypto : undefined;
    const nodeRequire =
      typeof module !== "undefined" &&
      typeof module.require === "function" &&
      module.require.bind(module);
    return {
      node: nodeRequire && !webCrypto ? nodeRequire("crypto") : undefined,
      web: webCrypto
    };
  })();