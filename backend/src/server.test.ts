import test from 'node:test';
import assert from 'node:assert/strict';
import { initDb } from './db.js';

initDb();

test('database initializes with admin user', async () => {
  const db = await import('./db.js');
  const row = db.default.prepare('SELECT email, role FROM users WHERE email = ?').get('admin@fundsroom.com') as { email: string; role: string };
  assert.equal(row?.email, 'admin@fundsroom.com');
  assert.equal(row?.role, 'Admin');
});
