import { encrypt, decrypt } from '@/lib/crypto'

const key = 'test-key-32-chars-long-padded!!'

describe('encrypt/decrypt', () => {
  it('round-trips a string', () => {
    const original = 'IGQVJXabc123token'
    const ciphertext = encrypt(original, key)
    expect(ciphertext).not.toBe(original)
    expect(decrypt(ciphertext, key)).toBe(original)
  })

  it('produces different ciphertext each time (IV is random)', () => {
    const ct1 = encrypt('same', key)
    const ct2 = encrypt('same', key)
    expect(ct1).not.toBe(ct2)
  })
})
