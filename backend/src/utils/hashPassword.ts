import { Prisma } from '@prisma/client';
import crypto from 'crypto';

export function generateSalt(length: number): string {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

export function hashPassword(password: string, salt: string): string {
  const hash = crypto.createHmac('sha256', salt);
  hash.update(password);
  const hashDigest = hash.digest('hex');
  return hashDigest;
}

export function verifiedPassword(verifyPassword: string, user: Prisma.UserCreateInput): boolean {
  return hashPassword(verifyPassword, user.password_salt) === user.password;
}
