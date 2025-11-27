/* Dashboard.jsx */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomizationModal from './CustomizationModal';
import AuthModal      from './AuthModal';
import AdminDashboard from './AdminDashboard';
import PaymentModal   from './PaymentModal';

const API_URL = 'https://brewtopia-backend.onrender.com';

export default function Dashboard() {
  /* --------------------  STATE  -------------------- */
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('customer');
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const categories = ['All','Milk Tea','Fruit Tea','Coffee','Specialty','Seasonal'];

  /* --------------------  HOOKS  -------------------- */
  useEffect(() => {
    loadProducts();
    const saved = localStorage.getItem('brewtopia_user');
    if (saved) {
      const u = JSON.parse(saved);
      setUser(u);
      if (u.role === 'admin') setCurrentView('admin');
    }

    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* --------------------  DATA  -------------------- */
  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/products`);
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered =
    activeCategory === 'All'
      ? products.filter(p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : products.filter(
          p =>
            p.category === activeCategory &&
            (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             p.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );

  /* --------------------  CART LOGIC  -------------------- */
  const addToCart = (product) => setSelectedProduct(product);

  const customizedAdd = (item) => {
    setCartLoading(true);
    setTimeout(() => {
      setCart((c) => [...c, item]);
      setCartLoading(false);
    }, 500);
  };

  const remove = (idx) => {
    setCartLoading(true);
    setTimeout(() => {
      setCart((c) => c.filter((_, i) => i !== idx));
      setCartLoading(false);
    }, 300);
  };

  const total = cart.reduce((t, i) => t + (i.finalPrice || i.price), 0);

  const checkout = () => (user ? setShowPaymentModal(true) : setShowAuthModal(true));

  const onPaySuccess = (details) => {
    setCartLoading(true);
    setTimeout(() => {
      alert(`Order placed! Total: ₱${total}\nPayment: ${details.method}`);
      setCart([]);
      setCartLoading(false);
      setShowPaymentModal(false);
    }, 2000);
  };

  /* --------------------  AUTH  -------------------- */
  const login = (u) => {
    setUser(u);
    localStorage.setItem('brewtopia_user', JSON.stringify(u));
    localStorage.setItem('brewtopia_token', u.token);
    if (u.role === 'admin') setCurrentView('admin');
  };
  const logout = () => {
    setUser(null);
    setCurrentView('customer');
    localStorage.removeItem('brewtopia_user');
    localStorage.removeItem('brewtopia_token');
  };
  const toAdmin   = () => user?.role === 'admin' && setCurrentView('admin');
  const toShop    = () => setCurrentView('customer');

  /* --------------------  ADMIN VIEW  -------------------- */
  if (currentView === 'admin' && user?.role === 'admin')
    return (
      <div className="admin-layout">
        <header className="admin-bar">
          <button onClick={toShop} className="btn secondary">← Back to Shop</button>
          <span>Welcome, Admin {user.name}</span>
          <button onClick={logout} className="btn danger">Logout</button>
        </header>
        <AdminDashboard />
      </div>
    );

  /* --------------------  LOADER  -------------------- */
  const Spinner = () => (
    <div className="spinner">
      <div /><div /><div />
    </div>
  );

  /* --------------------  JSX  -------------------- */
  return (
    <>
      <style>{`
        :root{
          --primary:#d63384;
          --bg:#fff8fb;
          --card:#ffffff;
          --text:#333;
          --muted:#888;
          --radius:16px;
          --shadow:0 4px 18px rgba(0,0,0,.06);
        }
        *{box-sizing:border-box;margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial;}
        body{background:var(--bg);color:var(--text);}
        .top-bar{
          position:sticky;top:0;left:0;right:0;
          background:#fff;border-bottom:1px solid #eee;
          display:flex;align-items:center;justify-content:space-between;
          padding:.75rem 1.25rem;z-index:10;
        }
        .top-bar.scrolled{box-shadow:var(--shadow);}
        .logo{font-size:1.5rem;font-weight:700;display:flex;align-items:center;gap:.5rem;}
        .search input{
          border:1px solid #ddd;border-radius:var(--radius);padding:.5rem .75rem;width:220px;
        }
        .top-actions{display:flex;align-items:center;gap:.75rem;}
        .cart-tag{
          background:var(--primary);color:#fff;
          padding:.35rem .75rem;border-radius:var(--radius);
          font-weight:600;cursor:pointer;
        }
        .wrapper{display:flex;gap:1.5rem;padding:1.5rem;max-width:1300px;margin:auto;}
        aside{width:380px;background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);padding:1.25rem;height:fit-content;position:sticky;top:90px;}
        main{flex:1;}
        .pills{display:flex;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap;}
        .pill{
          border:1px solid #ddd;background:#fff;padding:.4rem .9rem;border-radius:999px;font-size:.85rem;cursor:pointer;
        }
        .pill.active{background:var(--primary);color:#fff;border-color:var(--primary);}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem;}
        .product{
          background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);
          overflow:hidden;display:flex;flex-direction:column;
        }
        .product img{width:100%;height:140px;object-fit:cover;}
        .product-body{padding:.75rem 1rem 1rem;flex:1;display:flex;flex-direction:column;}
        .product-body h4{font-size:1rem;margin-bottom:.25rem;}
        .product-body p{font-size:.8rem;color:var(--muted);margin-bottom:.5rem;flex:1;}
        .product-footer{display:flex;align-items:center;justify-content:space-between;margin-top:.5rem;}
        .price{font-weight:700;color:var(--primary);}
        .btn{
          border:none;padding:.5rem .9rem;border-radius:var(--radius);font-weight:600;cursor:pointer;
        }
        .btn.primary{background:var(--primary);color:#fff;}
        .btn:disabled{opacity:.5;cursor:not-allowed;}
        .empty{text-align:center;padding:2rem 1rem;color:var(--muted);}
        .item-row{display:flex;justify-content:space-between;align-items:center;padding:.5rem 0;border-bottom:1px solid #f3f3f3;}
        .item-row:last-child{border:none;}
        .remove{background:none;border:none;font-size:1.2rem;color:#999;cursor:pointer;}
        .summary{border-top:1px solid #eee;margin-top:1rem;padding-top:1rem;display:flex;justify-content:space-between;align-items:center;font-size:1.1rem;font-weight:700;}
        .checkout{width:100%;margin-top:1rem;}
        .spinner{display:flex;gap:.25rem;justify-content:center;padding:2rem 0;}
        .spinner div{width:8px;height:8px;background:var(--primary);border-radius:50%;animation:bounce .6s infinite alternate;}
        .spinner div:nth-child(2){animation-delay:.15s;}
        .spinner div:nth-child(3){animation-delay:.3s;}
        @keyframes bounce{to{transform:translateY(-6px);}}
        @media(max-width:900px){
          .wrapper{flex-direction:column;}
          aside{width:100%;position:static;}
        }
      `}</style>

      {/* ------- HEADER ------- */}
      <header className={`top-bar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="logo">🧋 Brewtopia</div>
        <div className="search">
          <input
            placeholder="Search drinks…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="top-actions">
          {!user ? (
            <button className="btn primary" onClick={() => setShowAuthModal(true)}>Sign In</button>
          ) : (
            <>
              <span>Hi, {user.name}</span>
              {user.role === 'admin' && (
                <button className="btn secondary" onClick={toAdmin}>Admin</button>
              )}
              <button className="btn secondary" onClick={logout}>Logout</button>
            </>
          )}
          <div className="cart-tag" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
            🛒 {cart.length} · ₱{total}
          </div>
        </div>
      </header>

      {/* ------- BODY ------- */}
      <div className="wrapper">
        {/* PRODUCTS */}
        <main>
          <div className="pills">
            {categories.map((c) => (
              <button
                key={c}
                className={`pill ${activeCategory === c ? 'active' : ''}`}
                onClick={() => setActiveCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <div className="grid">
              {filtered.map((p) => (
                <div className="product" key={p._id}>
                  <img src={p.image || ''} alt={p.name} onError={(e) => (e.target.src = 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png')} />
                  <div className="product-body">
                    <h4>{p.name}</h4>
                    <p>{p.description}</p>
                    <div className="product-footer">
                      <span className="price">₱{p.price}</span>
                      <button className="btn primary" onClick={() => addToCart(p)}>Add</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* CART / YOUR ORDER */}
        <aside>
          <h3>Your Order</h3>
          {cartLoading ? (
            <Spinner />
          ) : cart.length === 0 ? (
            <div className="empty">
              <div style={{ fontSize: '2rem' }}>🧋</div>
              <p>Your cart is empty</p>
              <small>Add some drinks to get started</small>
            </div>
          ) : (
            <>
              {cart.map((it, idx) => (
                <div className="item-row" key={idx}>
                  <div>
                    <strong>{it.name}</strong>
                    <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>
                      {it.customizations.size} · {it.customizations.sugar} · {it.customizations.ice}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <span className="price">₱{it.finalPrice || it.price}</span>
                    <button className="remove" onClick={() => remove(idx)}>×</button>
                  </div>
                </div>
              ))}

              <div className="summary">
                <span>Total</span>
                <span className="price">₱{total}</span>
              </div>

              <button className="btn primary checkout" disabled={!user} onClick={checkout}>
                {user ? 'Proceed to Payment' : 'Sign In to Checkout'}
              </button>
            </>
          )}
        </aside>
      </div>

      {/* ------- MODALS ------- */}
      {selectedProduct && (
        <CustomizationModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={customizedAdd}
        />
      )}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onLogin={login} />}
      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={onPaySuccess}
          totalAmount={total}
          orderItems={cart}
        />
      )}
    </>
  );
}