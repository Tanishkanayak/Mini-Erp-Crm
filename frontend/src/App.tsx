import { useEffect, useState, type FormEvent } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';

interface User { id: number; name: string; email: string; role: string; token?: string; }

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [challans, setChallans] = useState<any[]>([]);
  const [loginForm, setLoginForm] = useState({ email: 'admin@fundsroom.com', password: 'admin123' });
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('fundsroom-user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchCustomers();
    fetchProducts();
    fetchChallans();
  }, [user]);

  async function fetchCustomers() {
    const res = await fetch('/api/customers', { headers: { Authorization: `Bearer ${user?.token}` } });
    const data = await res.json();
    setCustomers(data.data || []);
  }

  async function fetchProducts() {
    const res = await fetch('/api/products', { headers: { Authorization: `Bearer ${user?.token}` } });
    const data = await res.json();
    setProducts(data.data || []);
  }

  async function fetchChallans() {
    const res = await fetch('/api/challans', { headers: { Authorization: `Bearer ${user?.token}` } });
    const data = await res.json();
    setChallans(data || []);
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm)
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || 'Login failed');
    const nextUser = { ...data.user, token: data.token };
    localStorage.setItem('fundsroom-user', JSON.stringify(nextUser));
    setUser(nextUser);
    navigate('/');
  }

  function logout() {
    localStorage.removeItem('fundsroom-user');
    setUser(null);
    navigate('/login');
  }

  if (!user) {
    return (
      <div className="auth-shell">
        <form className="auth-card" onSubmit={handleLogin}>
          <h1>Fundsroom ERP</h1>
          <p>Wholesale distribution control center</p>
          <input value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} placeholder="Email" />
          <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="Password" />
          <button type="submit">Sign in</button>
        </form>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Fundsroom</h2>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/customers">Customers</Link>
          <Link to="/products">Products</Link>
          <Link to="/challans">Challans</Link>
        </nav>
        <button onClick={logout}>Logout</button>
      </aside>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard customers={customers} products={products} challans={challans} />} />
          <Route path="/customers" element={<CustomersView />} />
          <Route path="/products" element={<ProductsView />} />
          <Route path="/challans" element={<ChallansView />} />
          <Route path="/login" element={<div />} />
        </Routes>
      </main>
    </div>
  );
}

function Dashboard({ customers, products, challans }: { customers: any[]; products: any[]; challans: any[] }) {
  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="card">Customers: {customers.length}</div>
        <div className="card">Products: {products.length}</div>
        <div className="card">Challans: {challans.length}</div>
      </div>
    </div>
  );
}

function CustomersView() {
  const [form, setForm] = useState({ name: '', mobile: '', email: '', business_name: '', gst_number: '', customer_type: 'Retail', address: '', status: 'Lead', follow_up_date: '', notes: '' });
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  async function load() {
    const res = await fetch(`/api/customers?search=${search}`, { headers: { Authorization: `Bearer ${localStorage.getItem('fundsroom-user') ? JSON.parse(localStorage.getItem('fundsroom-user')!).token : ''}` } });
    const data = await res.json();
    setCustomers(data.data || []);
  }

  useEffect(() => { load(); }, [search]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JSON.parse(localStorage.getItem('fundsroom-user')!).token}` },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setForm({ name: '', mobile: '', email: '', business_name: '', gst_number: '', customer_type: 'Retail', address: '', status: 'Lead', follow_up_date: '', notes: '' });
      load();
    }
  }

  return (
    <div>
      <h1>Customers</h1>
      <form className="card" onSubmit={handleSubmit}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Business" value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
        <input placeholder="GST" value={form.gst_number} onChange={(e) => setForm({ ...form, gst_number: e.target.value })} />
        <select value={form.customer_type} onChange={(e) => setForm({ ...form, customer_type: e.target.value })}>
          <option value="Retail">Retail</option>
          <option value="Wholesale">Wholesale</option>
          <option value="Distributor">Distributor</option>
        </select>
        <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="Lead">Lead</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <input type="date" value={form.follow_up_date} onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })} />
        <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button type="submit">Add customer</button>
      </form>
      <input className="search" placeholder="Search customers" value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="list-grid">
        {customers.map((customer) => <div key={customer.id} className="card"><h3>{customer.name}</h3><p>{customer.mobile}</p><p>{customer.business_name}</p><p>Status: {customer.status}</p></div>)}
      </div>
    </div>
  );
}

function ProductsView() {
  const [form, setForm] = useState({ name: '', sku: '', category: '', unit_price: 0, current_stock: 0, minimum_stock: 0, location: '' });
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  async function load() {
    const res = await fetch(`/api/products?search=${search}`, { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('fundsroom-user')!).token}` } });
    const data = await res.json();
    setProducts(data.data || []);
  }

  useEffect(() => { load(); }, [search]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JSON.parse(localStorage.getItem('fundsroom-user')!).token}` },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setForm({ name: '', sku: '', category: '', unit_price: 0, current_stock: 0, minimum_stock: 0, location: '' });
      load();
    }
  }

  return (
    <div>
      <h1>Products</h1>
      <form className="card" onSubmit={handleSubmit}>
        <input placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
        <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
        <input type="number" placeholder="Unit price" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: Number(e.target.value) })} required />
        <input type="number" placeholder="Current stock" value={form.current_stock} onChange={(e) => setForm({ ...form, current_stock: Number(e.target.value) })} required />
        <input type="number" placeholder="Minimum stock" value={form.minimum_stock} onChange={(e) => setForm({ ...form, minimum_stock: Number(e.target.value) })} required />
        <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
        <button type="submit">Add product</button>
      </form>
      <input className="search" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="list-grid">
        {products.map((product) => <div key={product.id} className="card"><h3>{product.name}</h3><p>SKU: {product.sku}</p><p>Stock: {product.current_stock}</p><p>Price: {product.unit_price}</p></div>)}
      </div>
    </div>
  );
}

function ChallansView() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [challans, setChallans] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [status, setStatus] = useState('Draft');

  async function load() {
    const [cRes, pRes, chRes] = await Promise.all([
      fetch('/api/customers', { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('fundsroom-user')!).token}` } }),
      fetch('/api/products', { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('fundsroom-user')!).token}` } }),
      fetch('/api/challans', { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('fundsroom-user')!).token}` } })
    ]);
    const cData = await cRes.json();
    const pData = await pRes.json();
    const chData = await chRes.json();
    setCustomers(cData.data || []);
    setProducts(pData.data || []);
    setChallans(chData || []);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload = {
      customer_id: Number(customerId),
      status,
      items: items.map((item) => ({ product_id: Number(item.product_id), quantity: Number(item.quantity) })),
      created_by: JSON.parse(localStorage.getItem('fundsroom-user')!).name
    };
    const res = await fetch('/api/challans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JSON.parse(localStorage.getItem('fundsroom-user')!).token}` },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || 'Failed');
    load();
    alert('Challan created');
  }

  return (
    <div>
      <h1>Sales Challans</h1>
      <form className="card" onSubmit={handleSubmit}>
        <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
          <option value="">Select customer</option>
          {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Draft">Draft</option>
          <option value="Confirmed">Confirmed</option>
        </select>
        {items.map((item, index) => (
          <div key={index} className="row">
            <select value={item.product_id} onChange={(e) => { const next = [...items]; next[index].product_id = e.target.value; setItems(next); }} required>
              <option value="">Select product</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
            <input type="number" min="1" value={item.quantity} onChange={(e) => { const next = [...items]; next[index].quantity = Number(e.target.value); setItems(next); }} />
          </div>
        ))}
        <button type="button" onClick={() => setItems([...items, { product_id: '', quantity: 1 }])}>Add product</button>
        <button type="submit">Create challan</button>
      </form>
      <div className="list-grid">
        {challans.map((challan) => <div key={challan.id} className="card"><h3>{challan.challan_number}</h3><p>Customer: {challan.customer_name}</p><p>Status: {challan.status}</p><p>Total qty: {challan.total_quantity}</p></div>)}
      </div>
    </div>
  );
}

export default App;
