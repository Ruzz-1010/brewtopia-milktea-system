// AdminDashboard.jsx - ACTUAL MODERN DESIGN
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const API_URL = 'https://brewtopia-backend.onrender.com';

function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const showNotification = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/api/products`),
        axios.get(`${API_URL}/api/orders`).catch(() => 
          axios.get(`${API_URL}/api/admin/orders`).catch(() => ({ data: [] }))
        ),
        axios.get(`${API_URL}/api/users`).catch(() => 
          axios.get(`${API_URL}/api/admin/users`).catch(() => ({ data: [] }))
        )
      ]);
      
      setProducts(productsRes.data);
      
      const ordersData = ordersRes.data;
      if (Array.isArray(ordersData)) {
        setOrders(ordersData);
      } else if (ordersData.orders) {
        setOrders(ordersData.orders);
      } else {
        setOrders([]);
      }
      
      const usersData = usersRes.data;
      if (Array.isArray(usersData)) {
        setUsers(usersData);
      } else {
        setUsers([]);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateRevenue = () => {
    return orders
      .filter(order => order.status === 'completed' || order.status === 'ready')
      .reduce((total, order) => total + (order.totalAmount || 0), 0);
  };

  const getTotalCustomers = () => {
    return users.filter(user => user.role === 'customer').length;
  };

  const getTotalAdmins = () => {
    return users.filter(user => user.role === 'admin').length;
  };

  return (
    <div className="admin-dashboard">
      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="bubble-tea-spinner">
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <header className="admin-mobile-header">
        <button 
          className="menu-toggle"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <span>☰</span>
        </button>
        <div className="mobile-title">
          <h1>🧋 Brewtopia</h1>
        </div>
        <button className="refresh-btn" onClick={loadDashboardData}>
          🔄
        </button>
      </header>

      <div className="admin-container">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="brand">
              <div className="brand-icon">🧋</div>
              <div className="brand-text">
                <h2>Brewtopia</h2>
                <p>Admin Panel</p>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">Dashboard</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}
            >
              <span className="nav-icon">🛒</span>
              <span className="nav-text">Orders</span>
              <span className="nav-badge">{orders.filter(o => o.status === 'pending').length}</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }}
            >
              <span className="nav-icon">🥤</span>
              <span className="nav-text">Products</span>
              <span className="nav-badge">{products.length}</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}
            >
              <span className="nav-icon">👥</span>
              <span className="nav-text">Users</span>
              <span className="nav-badge">{users.length}</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-content">
              <div className="page-header">
                <h1>Dashboard Overview</h1>
                <p>Welcome to your business management panel</p>
              </div>

              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🥤</div>
                  <div className="stat-number">{products.length}</div>
                  <h3>Total Products</h3>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🛒</div>
                  <div className="stat-number">{orders.length}</div>
                  <h3>Total Orders</h3>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-number">₱{calculateRevenue().toLocaleString()}</div>
                  <h3>Revenue</h3>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-number">{users.length}</div>
                  <h3>Total Users</h3>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="activity-section">
                <div className="section-header">
                  <h2>Business Overview</h2>
                  <button 
                    className="view-all-btn"
                    onClick={() => setActiveTab('orders')}
                  >
                    View All Orders
                  </button>
                </div>
                
                <div className="business-stats">
                  <div className="stat-row">
                    <span>Pending Orders:</span>
                    <strong>{orders.filter(o => o.status === 'pending').length}</strong>
                  </div>
                  <div className="stat-row">
                    <span>Active Customers:</span>
                    <strong>{getTotalCustomers()}</strong>
                  </div>
                  <div className="stat-row">
                    <span>Admin Users:</span>
                    <strong>{getTotalAdmins()}</strong>
                  </div>
                  <div className="stat-row">
                    <span>Menu Categories:</span>
                    <strong>{[...new Set(products.map(p => p.category))].length}</strong>
                  </div>
                </div>
              </div>

              {/* Products Preview */}
              <div className="activity-section">
                <div className="section-header">
                  <h2>Popular Products</h2>
                  <button 
                    className="view-all-btn"
                    onClick={() => setActiveTab('products')}
                  >
                    View All Products
                  </button>
                </div>

                <div className="products-grid">
                  {products.slice(0, 3).map(product => (
                    <div key={product._id} className="product-card">
                      <div className="product-image">
                        {product.image ? (
                          <img src={product.image} alt={product.name} />
                        ) : (
                          <span>🧋</span>
                        )}
                      </div>
                      <div className="product-info">
                        <h3>{product.name}</h3>
                        <div className="product-price">₱{product.price}</div>
                        <span className="product-category">{product.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="products-content">
              <div className="page-header">
                <div className="header-content">
                  <h1>Product Management</h1>
                  <p>Manage your bubble tea menu</p>
                </div>
                <div className="header-actions">
                  <button className="btn-primary">
                    <span>➕</span>
                    Add Product
                  </button>
                  <button className="btn-primary" onClick={loadDashboardData}>
                    <span>🔄</span>
                    Refresh
                  </button>
                </div>
              </div>

              <div className="products-grid">
                {products.map(product => (
                  <div key={product._id} className="product-card">
                    <div className="product-image">
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <span>🧋</span>
                      )}
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <div className="product-price">₱{product.price}</div>
                      <span className="product-category">{product.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="orders-content">
              <div className="page-header">
                <div className="header-content">
                  <h1>Order Management</h1>
                  <p>Manage customer orders</p>
                </div>
                <div className="header-actions">
                  <button className="btn-primary" onClick={loadDashboardData}>
                    <span>🔄</span>
                    Refresh
                  </button>
                </div>
              </div>
              
              <div className="activity-section">
                <div className="orders-list">
                  {orders.map(order => (
                    <div key={order._id} className="order-item">
                      <div className="order-info">
                        <h4>Order #{order.orderNumber || order._id?.slice(-6)}</h4>
                        <span>Customer: {order.customer?.name || 'N/A'}</span>
                        <span>Total: ₱{order.totalAmount || 0}</span>
                      </div>
                      <div className="order-status">
                        <span>{order.status || 'pending'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="users-content">
              <div className="page-header">
                <div className="header-content">
                  <h1>User Management</h1>
                  <p>Manage system users</p>
                </div>
                <div className="header-actions">
                  <button className="btn-primary" onClick={loadDashboardData}>
                    <span>🔄</span>
                    Refresh
                  </button>
                </div>
              </div>
              
              <div className="activity-section">
                <div className="users-list">
                  {users.map(user => (
                    <div key={user._id} className="user-item">
                      <div className="user-info">
                        <h4>{user.name}</h4>
                        <span>{user.email}</span>
                        <span>Role: {user.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;  