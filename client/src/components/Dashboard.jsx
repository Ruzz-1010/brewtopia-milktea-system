/* Dashboard.jsx */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomizationModal from './CustomizationModal';
import AuthModal      from './AuthModal';
import AdminDashboard from './AdminDashboard';
import PaymentModal   from './PaymentModal';

const API_URL = 'https://brewtopia-backend.onrender.com';

export default function Dashboard() {
  /* ---------- state ---------- */
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

  /* ---------- hooks ---------- */
  useEffect(() => {
    loadProducts();
    const saved = localStorage.getItem('brewtopia_user');
    if (saved) {
      const u = JSON.parse(saved);
      setUser(u);
      if (u.role === 'admin') setCurrentView('admin');
    }
    const onScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ---------- data ---------- */
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

  /* ---------- cart ---------- */
  const addToCart = (p) => setSelectedProduct(p);

  const customizedAdd = (item) => {
    setCartLoading(true);
    setTimeout(() => {
      setCart((c) => [...c, item]);
      setCartLoading(false);
    }, 600);
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

  /* ---------- auth ---------- */
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
  const toAdmin = () => user?.role === 'admin' && setCurrentView('admin');
  const toShop  = () => setCurrentView('customer');

  /* ---------- admin ---------- */
  if (currentView === 'admin' && user?.role === 'admin')
    return (
      <div className="adminWrap">
        <header className="adminBar">
          <button onClick={toShop} className="btnSecondary">← Back to Shop</button>
          <span>Welcome, Admin {user.name}</span>
          <button onClick={logout} className="btnDanger">Logout</button>
        </header>
        <AdminDashboard />
        <style>{`
          .adminWrap{background:#fff8fb;min-height:100vh}
          .adminBar{display:flex;justify-content:space-between;align-items:center;padding:1rem 2rem;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.05)}
          .btnSecondary,.btnDanger{border:none;padding:.6rem 1rem;border-radius:12px;font-weight:600;cursor:pointer}
          .btnSecondary{background:#ffe0f0;color:#d63384}
          .btnDanger{background:#d63384;color:#fff}
        `}</style>
      </div>
    );

  /* ---------- loader ---------- */
  const Spinner = () => (
    <div className="spinner">
      <div /><div /><div />
    </div>
  );

  /* ---------- render ---------- */
  return (
    <>
      <style>{`
        :root{
          --pink:#d63384;
          --light:#ffe8f1;
          --bg:#fff8fb;
          --card:#ffffff;
          --text:#333;
          --muted:#777;
          --radius:20px;
          --shadow:0 6px 24px rgba(0,0,0,.06);
          font-size:18px;
        }
        *{box-sizing:border-box;margin:0;font-family:'Quicksand',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif}
        body{background:var(--bg);color:var(--text)}
        .topBar{
          position:sticky;top:0;left:0;right:0;
          background:#fff;border-bottom:2px solid var(--light);
          display:flex;align-items:center;justify-content:space-between;
          padding:1rem 2rem;z-index:10;
        }
        .topBar.scrolled{box-shadow:var(--shadow)}
        .logo{font-size:2.2rem;font-weight:800;display:flex;align-items:center;gap:.5rem;letter-spacing:-1px;color:var(--pink)}
        .logo span{font-size:2.8rem}
        .search input{
          border:2px solid var(--light);border-radius:var(--radius);padding:.7rem 1.2rem;
          width:280px;font-size:1.1rem;
        }
        .topActions{display:flex;align-items:center;gap:1rem}
        .cartTag{
          background:var(--pink);color:#fff;
          padding:.6rem 1.2rem;border-radius:var(--radius);
          font-weight:700;font-size:1.1rem;cursor:pointer;
        }
        .wrapper{display:flex;gap:2rem;padding:2rem;max-width:1400px;margin:auto}
        aside{width:420px;background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);padding:1.8rem;height:fit-content;position:sticky;top:110px}
        main{flex:1}
        .pills{display:flex;gap:.8rem;margin-bottom:1.8rem;flex-wrap:wrap}
        .pill{
          border:2px solid var(--light);background:#fff;padding:.6rem 1.3rem;border-radius:999px;
          font-size:1.1rem;font-weight:600;cursor:pointer;transition:.2s;
        }
        .pill.active{background:var(--pink);color:#fff;border-color:var(--pink)}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1.8rem}
        .product{
          background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);
          overflow:hidden;display:flex;flex-direction:column;transition:.25s;
        }
        .product:hover{transform:translateY(-6px)}
        .product img{width:100%;height:200px;object-fit:cover}
        .productBody{padding:1.2rem 1.5rem 1.5rem;flex:1;display:flex;flex-direction:column}
        .productBody h3{font-size:1.4rem;margin-bottom:.4rem}
        .productBody p{font-size:1rem;color:var(--muted);margin-bottom:.8rem;flex:1}
        .productFooter{display:flex;align-items:center;justify-content:space-between;margin-top:.8rem}
        .price{font-weight:800;color:var(--pink);font-size:1.3rem}
        .btn{
          border:none;padding:.7rem 1.3rem;border-radius:var(--radius);
          font-weight:700;font-size:1.1rem;cursor:pointer;transition:.2s;
        }
        .btnPrimary{background:var(--pink);color:#fff}
        .btn:disabled{opacity:.5;cursor:not-allowed}
        .empty{text-align:center;padding:3rem 1rem;color:var(--muted)}
        .empty div{font-size:3rem}
        .itemRow{display:flex;justify-content:space-between;align-items:center;padding:.7rem 0;border-bottom:1px solid #fce4f0}
        .itemRow:last-child{border:none}
        .remove{background:none;border:none;font-size:1.6rem;color:#bbb;cursor:pointer}
        .summary{border-top:2px solid #fce4f0;margin-top:1.2rem;padding-top:1.2rem;display:flex;justify-content:space-between;align-items:center;font-size:1.3rem;font-weight:800}
        .checkout{width:100%;margin-top:1.2rem;font-size:1.2rem;padding:.9rem}
        .spinner{display:flex;gap:.4rem;justify-content:center;padding:3rem 0}
        .spinner div{width:12px;height:12px;background:var(--pink);border-radius:50%;animation:bounce .6s infinite alternate}
        .spinner div:nth-child(2){animation-delay:.15s}
        .spinner div:nth-child(3){animation-delay:.3s}
        @keyframes bounce{to{transform:translateY(-8px)}}
        @media(max-width:900px){
          .wrapper{flex-direction:column}
          aside{width:100%;position:static}
        }
      `}</style>

      {/* ------- HEADER ------- */}
      <header className={`topBar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="logo"><span>🧋</span>Brewtopia</div>
        <div className="search">
          <input
            placeholder="Search your drink…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="topActions">
          {!user ? (
            <button className="btn btnPrimary" onClick={() => setShowAuthModal(true)}>Sign In</button>
          ) : (
            <>
              <span style={{ fontWeight: 600 }}>Hi, {user.name}</span>
              {user.role === 'admin' && (
                <button className="btn" style={{ background: '#ffe8f1', color: 'var(--pink)' }} onClick={toAdmin}>Admin</button>
              )}
              <button className="btn" style={{ background: '#ffe8f1', color: 'var(--pink)' }} onClick={logout}>Logout</button>
            </>
          )}
          <div className="cartTag" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
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
                  <img src={p.image || 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png'} alt={p.name} />
                  <div className="productBody">
                    <h3>{p.name}</h3>
                    <p>{p.description}</p>
                    <div className="productFooter">
                      <span className="price">₱{p.price}</span>
                      <button className="btn btnPrimary" onClick={() => addToCart(p)}>Add to Cart</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* YOUR ORDER */}
        <aside>
          <h2 style={{ marginBottom: '.8rem' }}>Your Order</h2>
          {cartLoading ? (
            <Spinner />
          ) : cart.length === 0 ? (
            <div className="empty">
              <div>🧋</div>
              <p>Your cart is empty</p>
              <small>Add some drinks to get started</small>
            </div>
          ) : (
            <>
              {cart.map((it, idx) => (
                <div className="itemRow" key={idx}>
                  <div>
                    <strong>{it.name}</strong>
                    <div style={{ fontSize: '.9rem', color: 'var(--muted)' }}>
                      {it.customizations.size} · {it.customizations.sugar} · {it.customizations.ice}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem' }}>
                    <span className="price">₱{it.finalPrice || it.price}</span>
                    <button className="remove" onClick={() => remove(idx)}>×</button>
                  </div>
                </div>
              ))}

              <div className="summary">
                <span>Total</span>
                <span className="price">₱{total}</span>
              </div>

              <button className="btn btnPrimary checkout" disabled={!user} onClick={checkout}>
                {user ? 'Proceed to Payment' : 'Sign In to Checkout'}
              </button>
            </>
          )}
        </aside>
      </div>

      {/* MODALS */}
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