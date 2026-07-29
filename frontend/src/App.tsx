import { useEffect, useState, type FormEvent } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';

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
        <div className="auth-card">
          <div className="auth-brand">
            <div className="brand-mark">FR</div>
            <div>
              <h1>Fundsroom ERP</h1>
              <p>Smarter wholesale operations, beautifully organized.</p>
            </div>
          </div>
          <div className="feature-pills">
            <span>Customer CRM</span>
            <span>Inventory flow</span>
            <span>Smart challans</span>
          </div>
          <form className="auth-form" onSubmit={handleLogin}>
            <input value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} placeholder="Email" />
            <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="Password" />
            <button type="submit">Sign in</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">FR</div>
          <div>
            <h2>Fundsroom</h2>
            <p>Operations hub</p>
          </div>
        </div>
        <nav>
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Dashboard</NavLink>
          <NavLink to="/customers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Customers</NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Products</NavLink>
          <NavLink to="/challans" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Challans</NavLink>
        </nav>
        <div className="sidebar-footer">
          <p>Everything in one place</p>
          <button onClick={logout}>Logout</button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h1>{user.name}</h1>
          </div>
          <div className="topbar-pill">Live dashboard</div>
        </header>
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
      <div className="stats-grid">
        <div className="card stat-card accent-emerald">
          <p className="stat-label">Customers</p>
          <h2>{customers.length}</h2>
          <span>Active relationships</span>
        </div>
        <div className="card stat-card accent-violet">
          <p className="stat-label">Products</p>
          <h2>{products.length}</h2>
          <span>Ready to sell</span>
        </div>
        <div className="card stat-card accent-coral">
          <p className="stat-label">Challans</p>
          <h2>{challans.length}</h2>
          <span>Tracked orders</span>
        </div>
      </div>
      <div className="card dashboard-panel">
        <h2>What you can do next</h2>
        <ul>
          <li>Review new customer leads and follow-ups.</li>
          <li>Keep stock levels healthy with product tracking.</li>
          <li>Create polished challans in seconds.</li>
        </ul>
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
