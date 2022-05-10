const test = require('tape')
import keccak256 from 'https://cdn.jsdelivr.net/npm/keccak256@latest/keccak256.js'

test('keccak256', t => {
  t.plan(2)

  t.equal(keccak256('hello').toString('hex'), '1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8')
  t.equal(keccak256(Buffer.from('hello')).toString('hex'), '1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8')
})