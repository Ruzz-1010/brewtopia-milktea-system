/* AdminDashboard.jsx  –  100 % responsive  */
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://brewtopia-backend.onrender.com';

export default function AdminDashboard() {
  /* ---------- state ---------- */
  const [products, setProducts]   = useState([]);
  const [orders, setOrders]       = useState([]);
  const [users, setUsers]         = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [tab, setTab]             = useState('dashboard');
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);

  const blank = { name:'', price:'', description:'', category:'Milk Tea', image:'' };
  const [form, setForm] = useState(blank);

  /* ---------- hooks ---------- */
  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pro, ord, usr, stats] = await Promise.all([
        axios.get(`${API_URL}/api/admin/products`).then(r=>r.data).catch(()=>[]),
        axios.get(`${API_URL}/api/orders`).then(r=>r.data).catch(()=>[]),
        axios.get(`${API_URL}/api/admin/users`).then(r=>r.data).catch(()=>[]),
        axios.get(`${API_URL}/api/admin/dashboard`).then(r=>r.data).catch(()=>({}))
      ]);
      setProducts(pro); 
      setOrders(Array.isArray(ord) ? ord : []); 
      setUsers(usr);
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally { 
      setLoading(false); 
    }
  };

  /* ---------- helpers ---------- */
  const toast = (m) => alert(m);
  const fmt   = (d) => d ? new Date(d).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric', hour: '2-digit', minute: '2-digit'}) : 'N/A';
  const revenue = orders.filter(o=> o.paymentStatus === 'paid').reduce((a,o)=>a+(o.totalAmount||0),0);
  const pending = orders.filter(o=> o.status==='pending').length;
  const completed = orders.filter(o=> o.status==='completed').length;

  /* ---------- products ---------- */
  const saveProduct = async (e) => {
    e.preventDefault();
    if (!form.name||!form.price) return toast('Name & price required');
    const payload = {...form, price:Number(form.price)};
    try {
      if (editing){
        await axios.put(`${API_URL}/api/admin/products/${editing._id}`,payload);
        toast('Updated ✔️');
      }else{
        await axios.post(`${API_URL}/api/admin/products`,{...payload,customizations:{
          sizes:[{name:'Regular',price:0},{name:'Large',price:20}],
          sugarLevels:['0%','25%','50%','75%','100%'],
          iceLevels:['No Ice','Less Ice','Regular Ice']
        }});
        toast('Added ✔️');
      }
      closeForm(); 
      loadAll();
    }catch(error){ 
      console.error('Save product error:', error);
      toast('Failed ❌'); 
    }
  };
  
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(blank); };
  const editProduct = (p) => { setEditing(p); setForm(p); setShowForm(true); };
  const delProduct = async (id) => {
    if (!window.confirm('Delete product?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/products/${id}`); 
      loadAll(); 
      toast('Deleted ✔️');
    } catch (error) {
      console.error('Delete product error:', error);
      toast('Delete failed ❌');
    }
  };

  /* ---------- orders ---------- */
  const statusList = ['pending','confirmed','preparing','ready','completed','cancelled'];
  const chgStatus = async (id,st) => {
    try {
      await axios.put(`${API_URL}/api/admin/orders/${id}/status`,{status:st}); 
      loadAll();
      toast(`Order status updated to ${st} ✔️`);
    } catch (error) {
      console.error('Update status error:', error);
      toast('Status update failed ❌');
    }
  };

  const updatePaymentStatus = async (id, paymentStatus) => {
    try {
      await axios.put(`${API_URL}/api/admin/orders/${id}/payment`, { paymentStatus });
      loadAll();
      toast(`Payment status updated to ${paymentStatus} ✔️`);
    } catch (error) {
      console.error('Update payment status error:', error);
      toast('Payment status update failed ❌');
    }
  };

  /* ---------- users ---------- */
  const chgRole = async (uid,role) => { 
    try {
      await axios.put(`${API_URL}/api/admin/users/${uid}/role`,{role}); 
      loadAll(); 
      toast(`User role updated to ${role} ✔️`);
    } catch (error) {
      console.error('Change role error:', error);
      toast('Role update failed ❌');
    }
  };
  
  const delUser = async (uid) => {
    if (!window.confirm('Delete user?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/users/${uid}`); 
      loadAll(); 
      toast('Deleted ✔️');
    } catch (error) {
      console.error('Delete user error:', error);
      toast('Delete failed ❌');
    }
  };

  /* ---------- dashboard stats ---------- */
  const getOrderStatusCount = (status) => {
    return orders.filter(order => order.status === status).length;
  };

  const getRecentOrders = () => {
    return orders
      .sort((a, b) => new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt))
      .slice(0, 10);
  };

  /* ---------- loader ---------- */
  if (loading) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',fontSize:'1.5rem',gap:'1rem'}}>
      <div style={{display:'flex',gap:'.5rem'}}>
        {[0,1,2].map(i=> <span key={i} style={{width:'12px',height:'12px',background:'#d63384',borderRadius:'50%',animation:'bounce .6s infinite alternate',animationDelay:i*0.15+'s'}}/>)}
      </div>
      Loading dashboard…
      <style>{`@keyframes bounce{to{transform:translateY(-8px)}}`}</style>
    </div>
  );

  /* ---------- jsx ---------- */
  return (
    <>
      <style>{`
        :root{ --pink:#d63384; --light:#ffe8f1; --bg:#fff8fb; --card:#fff; --text:#333; --muted:#777; --radius:16px; --shadow:0 4px 20px rgba(0,0,0,.06); }
        *{box-sizing:border-box;margin:0;font-family:'Quicksand',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial;}
        body{background:var(--bg);color:var(--text);}
        h1,h2,h3{letter-spacing:-.5px}
        .topBar{display:flex;align-items:center;justify-content:space-between;padding:1rem 2rem;background:var(--card);box-shadow:var(--shadow);}
        .tabs{display:flex;gap:.5rem;overflow-x:auto;padding:1rem 2rem;}
        .tab{padding:.6rem 1.2rem;border:2px solid var(--light);background:#fff;border-radius:999px;font-weight:600;cursor:pointer;white-space:nowrap;transition:.2s}
        .tab.active{background:var(--pink);color:#fff;border-color:var(--pink)}
        .badge{background:var(--pink);color:#fff;font-size:.7rem;padding:.15rem .4rem;border-radius:999px;margin-left:.4rem}
        .content{padding:2rem;max-width:1400px;margin:auto}
        .grid{display:grid;gap:1.5rem}
        .statCard{background:var(--card);padding:1.5rem;border-radius:var(--radius);box-shadow:var(--shadow);text-align:center}
        .statCard .ico{font-size:2.2rem;margin-bottom:.5rem}
        .statCard .num{font-size:2rem;font-weight:700;color:var(--pink)}
        .statCard .lbl{color:var(--muted)}
        .btn{border:none;padding:.6rem 1rem;border-radius:var(--radius);font-weight:600;cursor:pointer;transition:.2s}
        .btnPrim{background:var(--pink);color:#fff}
        .btnSec{background:var(--light);color:var(--pink)}
        .btnDanger{background:#ff4d4f;color:#fff}
        .btn:hover{opacity:.9}
        .card{background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);padding:1.2rem}
        .row{display:flex;flex-wrap:wrap;gap:1.5rem;margin-bottom:1.5rem}
        .row>*{flex:1 1 240px}
        table{width:100%;border-collapse:collapse;font-size:1rem}
        th,td{padding:.75rem 1rem;text-align:left;border-bottom:1px solid var(--light)}
        th{color:var(--muted);font-weight:600}
        select,input{border:1px solid var(--light);padding:.4rem;border-radius:8px;background:#fff}
        .modal{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:999;padding:1rem}
        .modalBox{background:var(--card);border-radius:var(--radius);width:100%;max-width:500px;max-height:90vh;overflow-y:auto;padding:2rem}
        .modalHead{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem}
        .close{background:none;border:none;font-size:1.5rem;cursor:pointer}
        .formGroup{margin-bottom:1rem}
        .formGroup label{display:block;margin-bottom:.4rem;font-weight:600}
        .formGroup input,.formGroup textarea,.formGroup select{width:100%;padding:.65rem;border:2px solid var(--light);border-radius:var(--radius);font-size:1rem}
        .formGroup textarea{resize:vertical;min-height:90px}
        .formActions{display:flex;gap:1rem;justify-content:flex-end;margin-top:1.2rem}
        
        /* Order status badges */
        .status-badge{padding:.2rem .6rem;border-radius:12px;font-size:.8rem;font-weight:600}
        .status-pending{background:#fff3cd;color:#856404}
        .status-confirmed{background:#d1ecf1;color:#0c5460}
        .status-preparing{background:#ffeaa7;color:#e17055}
        .status-ready{background:#d4edda;color:#155724}
        .status-completed{background:#c8e6c9;color:#2e7d32}
        .status-cancelled{background:#f8d7da;color:#721c24}
        
        .payment-badge{padding:.2rem .6rem;border-radius:12px;font-size:.8rem;font-weight:600}
        .payment-pending{background:#fff3cd;color:#856404}
        .payment-paid{background:#d4edda;color:#155724}
        .payment-failed{background:#f8d7da;color:#721c24}
        
        .order-item{background:#f8f9fa;padding:.5rem;border-radius:8px;margin:.2rem 0;font-size:.9rem}
        .order-items{max-height:200px;overflow-y:auto}
        
        @media(max-width:900px){
          .topBar,.tabs,.content{padding:1rem}
          .tabs{gap:.3rem}
          .tab{padding:.5rem .9rem;font-size:.95rem}
          .row{gap:1rem}
          table{font-size:.9rem}
          th,td{padding:.6rem .7rem}
        }
      `}</style>

      {/* ------- HEADER ------- */}
      <header className="topBar">
        <h1 style={{fontSize:'1.8rem',color:'var(--pink)'}}>🧋 Brewtopia Admin</h1>
        <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
          <span style={{color:'var(--muted)',fontSize:'.9rem'}}>
            Last updated: {new Date().toLocaleTimeString()}
          </span>
          <button className="btn btnSec" onClick={loadAll}>🔄 Refresh</button>
        </div>
      </header>

      {/* ------- TABS ------- */}
      <div className="tabs">
        {['dashboard','products','orders','users'].map(t=>(
          <button key={t} className={`tab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
            {t==='orders'&&!!pending&&<span className="badge">{pending}</span>}
            {t==='products'&&<span className="badge">{products.length}</span>}
            {t==='users'&&<span className="badge">{users.length}</span>}
          </button>
        ))}
      </div>

      {/* ------- CONTENT ------- */}
      <div className="content">

        {/* DASHBOARD */}
        {tab==='dashboard'&&<>
          <h2 style={{marginBottom:'1.2rem'}}>Dashboard Overview</h2>
          <div className="row">
            <div className="statCard">
              <div className="ico">🥤</div>
              <div className="num">{dashboardStats.totalProducts || products.length}</div>
              <div className="lbl">Products</div>
            </div>
            <div className="statCard">
              <div className="ico">🛒</div>
              <div className="num">{dashboardStats.totalOrders || orders.length}</div>
              <div className="lbl">Total Orders</div>
            </div>
            <div className="statCard">
              <div className="ico">💰</div>
              <div className="num">₱{(dashboardStats.totalRevenue || revenue).toLocaleString()}</div>
              <div className="lbl">Revenue</div>
            </div>
            <div className="statCard">
              <div className="ico">👥</div>
              <div className="num">{dashboardStats.totalUsers || users.length}</div>
              <div className="lbl">Users</div>
            </div>
          </div>

          <div className="row">
            <div className="statCard">
              <div className="ico">⏳</div>
              <div className="num">{dashboardStats.pendingOrders || pending}</div>
              <div className="lbl">Pending Orders</div>
            </div>
            <div className="statCard">
              <div className="ico">📅</div>
              <div className="num">{dashboardStats.todayOrders || 0}</div>
              <div className="lbl">Today's Orders</div>
            </div>
            <div className="statCard">
              <div className="ico">✅</div>
              <div className="num">{completed}</div>
              <div className="lbl">Completed</div>
            </div>
            <div className="statCard">
              <div className="ico">📊</div>
              <div className="num">{orders.length}</div>
              <div className="lbl">All Orders</div>
            </div>
          </div>

          <div style={{display:'flex',gap:'.75rem',marginBottom:'2rem',flexWrap:'wrap'}}>
            <button className="btn btnPrim" onClick={()=>{setEditing(null);setForm(blank);setShowForm(true)}}>+ Add Product</button>
            <button className="btn btnSec" onClick={loadAll}>Refresh All</button>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem'}}>
            {/* Order Status Breakdown */}
            <div className="card">
              <h3>Order Status</h3>
              {statusList.map(status => (
                <div key={status} style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--light)'}}>
                  <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                  <strong>{getOrderStatusCount(status)}</strong>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3>Recent Activity</h3>
              <div style={{fontSize: '0.9rem', color: 'var(--muted)'}}>
                <div>Total Products: <strong>{products.length}</strong></div>
                <div>Total Users: <strong>{users.length}</strong></div>
                <div>Total Revenue: <strong>₱{revenue.toLocaleString()}</strong></div>
                <div>Pending Orders: <strong>{pending}</strong></div>
              </div>
            </div>
          </div>

          <h3>Recent Orders</h3>
          {orders.length===0 ? (
            <div className="card empty" style={{textAlign:'center',color:'var(--muted)'}}>No orders yet</div>
          ) : (
            <div className="grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))'}}>
              {getRecentOrders().map(o=>(
                <div className="card" key={o._id}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem'}}>
                    <div>
                      <strong>#{o.orderNumber || o._id?.slice(-6) || 'N/A'}</strong>
                      <div style={{color:'var(--muted)',fontSize:'.8rem'}}>{o.customer?.name || 'N/A'} • {o.customer?.email}</div>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <div className={`status-badge status-${o.status || 'pending'}`}>
                        {o.status || 'pending'}
                      </div>
                      <div className={`payment-badge payment-${o.paymentStatus || 'pending'}`} style={{marginTop: '0.2rem', fontSize: '0.7rem'}}>
                        {o.paymentStatus || 'pending'}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{marginBottom: '0.5rem'}}>
                    <div style={{fontSize: '0.9rem'}}>Items: {o.items?.length || 0}</div>
                    <div style={{fontSize: '0.9rem', fontWeight: 'bold'}}>Total: ₱{o.totalAmount || 0}</div>
                  </div>

                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap: '0.5rem'}}>
                    <select value={o.status||'pending'} onChange={e=>chgStatus(o._id,e.target.value)} style={{fontSize:'.8rem', flex: 1}}>
                      {statusList.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                    <select 
                      value={o.paymentStatus||'pending'} 
                      onChange={e=>updatePaymentStatus(o._id, e.target.value)}
                      style={{fontSize:'.8rem', flex: 1}}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  
                  <div style={{color:'var(--muted)',fontSize:'.7rem',marginTop:'.3rem'}}>
                    {fmt(o.orderDate || o.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>}

        {/* PRODUCTS */}
        {tab==='products'&&<>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.2rem'}}>
            <h2>Products ({products.length})</h2>
            <button className="btn btnPrim" onClick={()=>{setEditing(null);setForm(blank);setShowForm(true)}}>+ Add Product</button>
          </div>
          {products.length===0 ? (
            <div className="card empty" style={{textAlign:'center'}}>
              No products yet<br/>
              <button className="btn btnPrim" style={{marginTop:'.8rem'}} onClick={()=>setShowForm(true)}>Add First Product</button>
            </div>
          ) : (
            <div className="grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))'}}>
              {products.map(p=>(
                <div className="card" key={p._id}>
                  <img src={p.image||'https://cdn-icons-png.flaticon.com/512/3075/3075977.png'} alt={p.name} style={{width:'100%',height:160,objectFit:'cover',borderRadius:'8px',marginBottom:'.6rem'}}/>
                  <h3 style={{fontSize:'1.2rem'}}>{p.name}</h3>
                  <div style={{fontSize:'.9rem',color:'var(--muted)',marginBottom:'0.5rem'}}>{p.category || 'Uncategorized'}</div>
                  <p style={{fontSize:'.9rem',color:'var(--muted)',minHeight:'40px',marginBottom:'0.5rem'}}>{p.description||'No description'}</p>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'.6rem'}}>
                    <span className="price" style={{fontWeight:700,color:'var(--pink)',fontSize:'1.1rem'}}>₱{p.price}</span>
                    <div style={{display:'flex',gap:'.4rem'}}>
                      <button className="btn btnSec" onClick={()=>editProduct(p)}>✏️ Edit</button>
                      <button className="btn btnDanger" onClick={()=>delProduct(p._id)}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>}

        {/* ORDERS */}
        {tab==='orders'&&<>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
            <h2>Orders ({orders.length})</h2>
            <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
              <input 
                type="text" 
                placeholder="Search orders..." 
                style={{padding: '0.5rem', border: '1px solid var(--light)', borderRadius: '8px'}}
                onChange={(e) => {
                  // Add search functionality here if needed
                }}
              />
              <button className="btn btnSec" onClick={loadAll}>Refresh</button>
            </div>
          </div>
          {orders.length===0 ? (
            <div className="card empty" style={{textAlign:'center'}}>No orders yet</div>
          ) : (
            <div style={{overflowX:'auto'}}>
              <table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o=>(
                    <tr key={o._id}>
                      <td><strong>#{o.orderNumber || o._id?.slice(-6) || 'N/A'}</strong></td>
                      <td>
                        {o.customer?.name || 'N/A'}
                        <br/>
                        <span style={{fontSize:'.85rem',color:'var(--muted)'}}>{o.customer?.email}</span>
                        <br/>
                        <span style={{fontSize:'.75rem',color:'var(--muted)'}}>{o.customer?.phone || 'No phone'}</span>
                      </td>
                      <td>
                        <div className="order-items">
                          {o.items?.map((item, index) => (
                            <div key={index} className="order-item">
                              {item.name} × {item.quantity}
                              <br/>
                              <small>₱{item.finalPrice || item.price}</small>
                              {item.customizations && (
                                <div style={{fontSize: '0.7rem', color: 'var(--muted)'}}>
                                  {item.customizations.size} • {item.customizations.sugar} • {item.customizations.ice}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td style={{fontWeight:600}}>₱{o.totalAmount || 0}</td>
                      <td>
                        <select value={o.status||'pending'} onChange={e=>chgStatus(o._id,e.target.value)}>
                          {statusList.map(s=><option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
                        <select 
                          value={o.paymentStatus||'pending'} 
                          onChange={e=>updatePaymentStatus(o._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                        </select>
                      </td>
                      <td>{fmt(o.orderDate || o.createdAt)}</td>
                      <td>
                        <button 
                          className="btn btnDanger" 
                          onClick={() => {
                            if (window.confirm('Delete this order?')) {
                              // Add delete order functionality here
                              toast('Order deletion not implemented yet');
                            }
                          }}
                          style={{fontSize: '0.8rem', padding: '0.3rem 0.6rem'}}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>}

        {/* USERS */}
        {tab==='users'&&<>
          <h2 style={{marginBottom:'1rem'}}>Users ({users.length})</h2>
          {users.length===0 ? (
            <div className="card empty" style={{textAlign:'center'}}>No users yet</div>
          ) : (
            <div style={{overflowX:'auto'}}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u=>(
                    <tr key={u._id}>
                      <td style={{fontWeight:600}}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone || 'N/A'}</td>
                      <td>
                        <select value={u.role} onChange={e=>chgRole(u._id,e.target.value)}>
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>{fmt(u.createdAt)}</td>
                      <td>
                        <button 
                          className="btn btnDanger" 
                          onClick={()=>delUser(u._id)} 
                          disabled={u.role==='admin'}
                          title={u.role==='admin' ? 'Cannot delete admin users' : 'Delete user'}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>}
      </div>

      {/* ------- MODAL ------- */}
      {showForm&&
        <div className="modal" onClick={closeForm}>
          <div className="modalBox" onClick={e=>e.stopPropagation()}>
            <div className="modalHead">
              <h3>{editing?'Edit Product':'Add Product'}</h3>
              <button className="close" onClick={closeForm}>✕</button>
            </div>
            <form onSubmit={saveProduct}>
              <div className="formGroup">
                <label>Name *</label>
                <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Classic Milk Tea"/>
              </div>
              <div className="formGroup">
                <label>Price (₱) *</label>
                <input required type="number" min="0" step="0.01" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
              </div>
              <div className="formGroup">
                <label>Category</label>
                <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                  {['Milk Tea','Fruit Tea','Coffee','Specialty','Seasonal'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="formGroup">
                <label>Description</label>
                <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Short description"/>
              </div>
              <div className="formGroup">
                <label>Image URL</label>
                <input type="url" value={form.image} onChange={e=>setForm({...form,image:e.target.value})} placeholder="https://…"/>
              </div>
              <div className="formActions">
                <button type="button" className="btn btnSec" onClick={closeForm}>Cancel</button>
                <button type="submit" className="btn btnPrim">{editing?'Update':'Add'}</button>
              </div>
            </form>
          </div>
        </div>}
    </>
  );
}