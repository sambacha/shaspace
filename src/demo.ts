// keccak(rlp(logs[])


import {
  sha3_224,
  sha3_256,
  sha3_384,
  sha3_512,
  keccak_224,
  keccak_256,
  keccak_384,
  keccak_512,
  shake128,
  shake256,
} from '@noble/hashes/sha3';

const h6a = keccak_256('abc');
console.log(h6a);

// small utility method that converts bytes to hex
import { bytesToHex, as, toHex } from '@noble/hashes/utils';
console.log(toHex(sha256('abc')));