import crypto from 'crypto';

const API_KEY_PREFIX = 'amp_';
const API_KEY_BYTES = 32;

export function generateApiKey(): { key: string; prefix: string } {
  const randomBytes = crypto.randomBytes(API_KEY_BYTES);
  const key = API_KEY_PREFIX + randomBytes.toString('hex');
  const prefix = key.substring(0, 12); // amp_ + first 8 chars of hex
  return { key, prefix };
}

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export function verifyApiKey(key: string, hash: string): boolean {
  const keyHash = hashApiKey(key);
  return crypto.timingSafeEqual(Buffer.from(keyHash), Buffer.from(hash));
}

