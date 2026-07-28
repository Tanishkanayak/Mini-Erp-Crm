import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { z } from 'zod';
import db, { initDb } from './db.js';
import { comparePassword, getUserByEmail, hashPassword, signToken, verifyToken } from './auth.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

initDb();

function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    req.user = verifyToken(authHeader.substring(7));
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function roleMiddleware(roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/auth/login', (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string().min(4) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });

  const user = getUserByEmail(parsed.data.email);
  if (!user || !comparePassword(parsed.data.password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role as any });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.get('/api/customers', authMiddleware, (req, res) => {
  const page = Number(req.query.page || 1);
  const search = String(req.query.search || '').trim();
  const offset = (page - 1) * 10;
  const query = search
    ? 'SELECT * FROM customers WHERE name LIKE ? OR business_name LIKE ? OR mobile LIKE ? ORDER BY created_at DESC LIMIT 10 OFFSET ?'
    : 'SELECT * FROM customers ORDER BY created_at DESC LIMIT 10 OFFSET ?';
  const params = search ? [`%${search}%`, `%${search}%`, `%${search}%`, offset] : [offset];
  const rows = db.prepare(query).all(...params) as any[];
  const total = db.prepare(search ? 'SELECT COUNT(*) as count FROM customers WHERE name LIKE ? OR business_name LIKE ? OR mobile LIKE ?' : 'SELECT COUNT(*) as count FROM customers').get(...(search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [])) as { count: number };
  res.json({ data: rows, page, totalPages: Math.ceil(total.count / 10), total: total.count });
});

app.post('/api/customers', authMiddleware, (req, res) => {
  const schema = z.object({
    name: z.string().min(1),
    mobile: z.string().min(4),
    email: z.string().email().optional().or(z.literal('')),
    business_name: z.string().optional().or(z.literal('')),
    gst_number: z.string().optional().or(z.literal('')),
    customer_type: z.string().min(1),
    address: z.string().optional().or(z.literal('')),
    status: z.string().min(1),
    follow_up_date: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });

  const { name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes } = parsed.data;
  const insert = db.prepare(`
    INSERT INTO customers (name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = insert.run(name, mobile, email || null, business_name || null, gst_number || null, customer_type, address || null, status, follow_up_date || null, notes || null);
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(customer);
});

app.get('/api/customers/:id', authMiddleware, (req, res) => {
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  const followUps = db.prepare('SELECT * FROM customer_follow_ups WHERE customer_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json({ ...customer, followUps });
});

app.put('/api/customers/:id', authMiddleware, (req, res) => {
  const schema = z.object({
    name: z.string().min(1),
    mobile: z.string().min(4),
    email: z.string().email().optional().or(z.literal('')),
    business_name: z.string().optional().or(z.literal('')),
    gst_number: z.string().optional().or(z.literal('')),
    customer_type: z.string().min(1),
    address: z.string().optional().or(z.literal('')),
    status: z.string().min(1),
    follow_up_date: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });

  const { name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes } = parsed.data;
  db.prepare(`
    UPDATE customers SET name = ?, mobile = ?, email = ?, business_name = ?, gst_number = ?, customer_type = ?, address = ?, status = ?, follow_up_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(name, mobile, email || null, business_name || null, gst_number || null, customer_type, address || null, status, follow_up_date || null, notes || null, req.params.id);
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
  res.json(customer);
});

app.post('/api/customers/:id/follow-ups', authMiddleware, (req, res) => {
  const schema = z.object({ note: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });

  const info = db.prepare('INSERT INTO customer_follow_ups (customer_id, note) VALUES (?, ?)').run(req.params.id, parsed.data.note);
  const followUp = db.prepare('SELECT * FROM customer_follow_ups WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(followUp);
});

app.get('/api/products', authMiddleware, (req, res) => {
  const page = Number(req.query.page || 1);
  const search = String(req.query.search || '').trim();
  const offset = (page - 1) * 10;
  const query = search
    ? 'SELECT * FROM products WHERE name LIKE ? OR sku LIKE ? OR category LIKE ? ORDER BY created_at DESC LIMIT 10 OFFSET ?'
    : 'SELECT * FROM products ORDER BY created_at DESC LIMIT 10 OFFSET ?';
  const params = search ? [`%${search}%`, `%${search}%`, `%${search}%`, offset] : [offset];
  const rows = db.prepare(query).all(...params) as any[];
  const total = db.prepare(search ? 'SELECT COUNT(*) as count FROM products WHERE name LIKE ? OR sku LIKE ? OR category LIKE ?' : 'SELECT COUNT(*) as count FROM products').get(...(search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [])) as { count: number };
  res.json({ data: rows, page, totalPages: Math.ceil(total.count / 10), total: total.count });
});

app.post('/api/products', authMiddleware, (req, res) => {
  const schema = z.object({
    name: z.string().min(1),
    sku: z.string().min(1),
    category: z.string().min(1),
    unit_price: z.number().min(0),
    current_stock: z.number().int().min(0),
    minimum_stock: z.number().int().min(0),
    location: z.string().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });

  const info = db.prepare(`
    INSERT INTO products (name, sku, category, unit_price, current_stock, minimum_stock, location)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(parsed.data.name, parsed.data.sku, parsed.data.category, parsed.data.unit_price, parsed.data.current_stock, parsed.data.minimum_stock, parsed.data.location);
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(product);
});

app.put('/api/products/:id', authMiddleware, (req, res) => {
  const schema = z.object({
    name: z.string().min(1),
    sku: z.string().min(1),
    category: z.string().min(1),
    unit_price: z.number().min(0),
    current_stock: z.number().int().min(0),
    minimum_stock: z.number().int().min(0),
    location: z.string().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });

  const info = db.prepare(`
    UPDATE products SET name = ?, sku = ?, category = ?, unit_price = ?, current_stock = ?, minimum_stock = ?, location = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(parsed.data.name, parsed.data.sku, parsed.data.category, parsed.data.unit_price, parsed.data.current_stock, parsed.data.minimum_stock, parsed.data.location, req.params.id);
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json(product);
});

app.post('/api/stock-movements', authMiddleware, (req, res) => {
  const schema = z.object({
    product_id: z.number().int().positive(),
    quantity_changed: z.number().int(),
    movement_type: z.enum(['IN', 'OUT']),
    reason: z.string().min(1),
    created_by: z.string().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(parsed.data.product_id) as any;
  if (!product) return res.status(404).json({ message: 'Product not found' });

  if (parsed.data.movement_type === 'OUT' && product.current_stock < parsed.data.quantity_changed) {
    return res.status(400).json({ message: 'Stock cannot go negative' });
  }

  const newStock = parsed.data.movement_type === 'OUT' ? product.current_stock - parsed.data.quantity_changed : product.current_stock + parsed.data.quantity_changed;
  db.prepare('UPDATE products SET current_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStock, parsed.data.product_id);
  db.prepare('INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by) VALUES (?, ?, ?, ?, ?)').run(parsed.data.product_id, parsed.data.quantity_changed, parsed.data.movement_type, parsed.data.reason, parsed.data.created_by);
  res.status(201).json({ productId: parsed.data.product_id, currentStock: newStock });
});

app.get('/api/stock-movements', authMiddleware, (req, res) => {
  const page = Number(req.query.page || 1);
  const offset = (page - 1) * 10;
  const rows = db.prepare('SELECT * FROM stock_movements ORDER BY created_at DESC LIMIT 10 OFFSET ?').all(offset) as any[];
  const total = db.prepare('SELECT COUNT(*) as count FROM stock_movements').get() as { count: number };
  res.json({ data: rows, page, totalPages: Math.ceil(total.count / 10), total: total.count });
});

app.get('/api/challans', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM challans ORDER BY created_at DESC').all() as any[];
  res.json(rows);
});

app.post('/api/challans', authMiddleware, (req, res) => {
  const schema = z.object({
    customer_id: z.number().int().positive(),
    status: z.enum(['Draft', 'Confirmed', 'Cancelled']),
    items: z.array(z.object({ product_id: z.number().int().positive(), quantity: z.number().int().positive() })).min(1),
    created_by: z.string().min(1)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });

  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(parsed.data.customer_id) as any;
  if (!customer) return res.status(404).json({ message: 'Customer not found' });

  const challanNumber = `CH-${Date.now()}`;
  const totalQuantity = parsed.data.items.reduce((sum, item) => sum + item.quantity, 0);

  const insertChallan = db.prepare(`
    INSERT INTO challans (challan_number, customer_id, customer_name, total_quantity, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const challanInfo = insertChallan.run(challanNumber, parsed.data.customer_id, customer.name, totalQuantity, parsed.data.status, parsed.data.created_by);

  for (const item of parsed.data.items) {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id) as any;
    if (!product) return res.status(404).json({ message: `Product ${item.product_id} not found` });
    if (parsed.data.status === 'Confirmed' && product.current_stock < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
    }
  }

  for (const item of parsed.data.items) {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id) as any;
    const totalPrice = Number(product.unit_price) * item.quantity;
    db.prepare(`
      INSERT INTO challan_items (challan_id, product_id, product_name, sku, quantity, unit_price, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(challanInfo.lastInsertRowid, item.product_id, product.name, product.sku, item.quantity, product.unit_price, totalPrice);
    if (parsed.data.status === 'Confirmed') {
      db.prepare('UPDATE products SET current_stock = current_stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(item.quantity, item.product_id);
      db.prepare('INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by) VALUES (?, ?, ?, ?, ?)').run(item.product_id, item.quantity, 'OUT', `Sales challan ${challanNumber}`, parsed.data.created_by);
    }
  }

  const challan = db.prepare('SELECT * FROM challans WHERE id = ?').get(challanInfo.lastInsertRowid) as any;
  const items = db.prepare('SELECT * FROM challan_items WHERE challan_id = ?').all(challanInfo.lastInsertRowid) as any[];
  res.status(201).json({ challan, items });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
