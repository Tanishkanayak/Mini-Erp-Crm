import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';
import { UserRole } from './types.js';

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(plain: string, hash: string) {
  return bcrypt.compareSync(plain, hash);
}

export function signToken(payload: { id: number; email: string; role: UserRole }) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '8h' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { id: number; email: string; role: UserRole };
}

export function getUserByEmail(email: string) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
}
