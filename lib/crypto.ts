import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

function deriveKey(secret: string): Buffer {
  const salt = process.env.CRYPTO_SALT ?? 'auditoria-dev-salt-change-in-prod'
  return scryptSync(secret, salt, 32)
}

export function encrypt(plaintext: string, secret: string): string {
  const key = deriveKey(secret)
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-cbc', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`
}

export function decrypt(ciphertext: string, secret: string): string {
  if (!ciphertext.includes(':')) throw new Error('Invalid ciphertext format')
  const [ivHex, encHex] = ciphertext.split(':')
  const key = deriveKey(secret)
  const iv = Buffer.from(ivHex, 'hex')
  const decipher = createDecipheriv('aes-256-cbc', key, iv)
  return Buffer.concat([decipher.update(Buffer.from(encHex, 'hex')), decipher.final()]).toString('utf8')
}
