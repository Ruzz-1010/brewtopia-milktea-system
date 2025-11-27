import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const API_URL = 'https://brewtopia-backend.onrender.com';

function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/dashboard`),
        axios.get(`${API_URL}/api/admin/orders?limit=20`),
        axios.get(`${API_URL}/api/products`)
      ]);
      
      setStats(statsRes.data);
      setOrders(ordersRes.data.orders || []);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/admin/orders/${orderId}/status`, {
        status: newStatus
      });
      loadDashboardData();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      confirmed: '#3498db',
      preparing: '#9b59b6',
      ready: '#2ecc71',
      completed: '#27ae60',
      cancelled: '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateRevenue = () => {
    return orders
      .filter(order => order.status === 'completed' || order.status === 'ready')
      .reduce((total, order) => total + (order.totalAmount || 0), 0);
  };

  return (
    <div className="admin-dashboard">
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
          <span>Admin</span>
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
              {stats.pendingOrders > 0 && (
                <span className="nav-badge">{stats.pendingOrders}</span>
              )}
            </button>

            <button 
              className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }}
            >
              <span className="nav-icon">🥤</span>
              <span className="nav-text">Products</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }}
            >
              <span className="nav-icon">📈</span>
              <span className="nav-text">Analytics</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">👤</div>
              <div className="user-details">
                <span className="user-name">Admin User</span>
                <span className="user-role">Administrator</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <p>Loading data...</p>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-content">
              <div className="page-header">
                <h1>Dashboard Overview</h1>
                <p>Real-time business insights and metrics</p>
              </div>

              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon revenue">💰</div>
                    <div className="stat-trend up">+12%</div>
                  </div>
                  <div className="stat-content">
                    <h3>Total Revenue</h3>
                    <div className="stat-number">₱{calculateRevenue().toLocaleString()}</div>
                    <p className="stat-description">All time sales</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon orders">📦</div>
                    <div className="stat-trend up">+5%</div>
                  </div>
                  <div className="stat-content">
                    <h3>Total Orders</h3>
                    <div className="stat-number">{stats.totalOrders || 0}</div>
                    <p className="stat-description">All orders processed</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon pending">⏳</div>
                    <div className="stat-trend down">-3%</div>
                  </div>
                  <div className="stat-content">
                    <h3>Pending Orders</h3>
                    <div className="stat-number">{stats.pendingOrders || 0}</div>
                    <p className="stat-description">Awaiting processing</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon today">📅</div>
                    <div className="stat-trend up">+8%</div>
                  </div>
                  <div className="stat-content">
                    <h3>Today's Orders</h3>
                    <div className="stat-number">{stats.todayOrders || 0}</div>
                    <p className="stat-description">Orders today</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="activity-section">
                <div className="section-header">
                  <h2>Recent Orders</h2>
                  <button 
                    className="view-all-btn"
                    onClick={() => setActiveTab('orders')}
                  >
                    View All Orders
                  </button>
                </div>

                <div className="orders-list">
                  {orders.slice(0, 6).map(order => (
                    <div key={order._id} className="order-item">
                      <div className="order-info">
                        <div className="order-main">
                          <h4>Order #{order.orderNumber}</h4>
                          <span className="customer">{order.customer?.name}</span>
                        </div>
                        <div className="order-details">
                          <span className="amount">₱{order.totalAmount}</span>
                          <span className="date">{formatDate(order.orderDate)}</span>
                        </div>
                      </div>
                      <div className="order-actions">
                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="status-select"
                          style={{ borderColor: getStatusColor(order.status) }}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="confirmed">✅ Confirmed</option>
                          <option value="preparing">👨‍🍳 Preparing</option>
                          <option value="ready">🥤 Ready</option>
                          <option value="completed">📦 Completed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="orders-content">
              <div className="page-header">
                <div className="header-content">
                  <h1>Order Management</h1>
                  <p>Manage and track customer orders</p>
                </div>
                <div className="header-actions">
                  <button className="btn-primary" onClick={loadDashboardData}>
                    🔄 Refresh
                  </button>
                </div>
              </div>

              <div className="orders-table">
                <div className="table-header">
                  <div className="table-row header-row">
                    <div>Order #</div>
                    <div>Customer</div>
                    <div>Items</div>
                    <div>Amount</div>
                    <div>Status</div>
                    <div>Date</div>
                    <div>Actions</div>
                  </div>
                </div>
                <div className="table-body">
                  {orders.map(order => (
                    <div key={order._id} className="table-row">
                      <div className="order-number">
                        <strong>#{order.orderNumber}</strong>
                      </div>
                      <div className="customer">
                        <div className="customer-name">{order.customer?.name}</div>
                        <div className="customer-contact">{order.customer?.phone}</div>
                      </div>
                      <div className="items">
                        {order.items?.length || 0} items
                      </div>
                      <div className="amount">
                        <strong>₱{order.totalAmount}</strong>
                      </div>
                      <div className="status">
                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className={`status-select ${order.status}`}
                          style={{ borderColor: getStatusColor(order.status) }}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="confirmed">✅ Confirmed</option>
                          <option value="preparing">👨‍🍳 Preparing</option>
                          <option value="ready">🥤 Ready</option>
                          <option value="completed">📦 Completed</option>
                        </select>
                      </div>
                      <div className="date">
                        {formatDate(order.orderDate)}
                      </div>
                      <div className="actions">
                        <button className="btn-action view">👁️</button>
                        <button className="btn-action edit">✏️</button>
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
                  <p>Manage your milk tea menu</p>
                </div>
                <div className="header-actions">
                  <button className="btn-primary">
                    ➕ Add Product
                  </button>
                </div>
              </div>

              <div className="products-grid">
                {products.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      <span className="product-emoji">{product.image}</span>
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="product-description">{product.description}</p>
                      <div className="product-meta">
                        <span className="product-price">₱{product.price}</span>
                        <span className="product-category">{product.category}</span>
                      </div>
                      <div className="customization-info">
                        <div className="customization-item">
                          <span>Sizes: {product.customizations?.sizes?.length || 0}</span>
                        </div>
                        <div className="customization-item">
                          <span>Add-ons: {product.customizations?.addons?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="product-actions">
                      <button className="btn-secondary">✏️ Edit</button>
                      <button className="btn-status active">✅ Active</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="analytics-content">
              <div className="page-header">
                <h1>Sales Analytics</h1>
                <p>Business performance insights</p>
              </div>

              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>📊 Order Statistics</h3>
                  <div className="analytics-stats">
                    <div className="stat-item">
                      <span className="stat-label">Completed Orders</span>
                      <span className="stat-value">
                        {orders.filter(o => o.status === 'completed').length}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Average Order Value</span>
                      <span className="stat-value">
                        ₱{orders.length > 0 ? (calculateRevenue() / orders.length).toFixed(2) : '0.00'}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Popular Product</span>
                      <span className="stat-value">
                        {products[0]?.name || 'Classic Milk Tea'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="analytics-card">
                  <h3>📈 Quick Insights</h3>
                  <div className="insights-list">
                    <div className="insight-item positive">
                      <span>📈 Sales trending up this week</span>
                    </div>
                    <div className="insight-item positive">
                      <span>👍 Customer satisfaction high</span>
                    </div>
                    <div className="insight-item neutral">
                      <span>⚡ Fast order processing</span>
                    </div>
                    <div className="insight-item negative">
                      <span>⚠️ Monitor inventory levels</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {orders.slice(0, 5).map(order => (
                    <div key={order._id} className="activity-item">
                      <div className="activity-icon">🛒</div>
                      <div className="activity-content">
                        <p>
                          <strong>Order #{order.orderNumber}</strong> from {order.customer?.name}
                        </p>
                        <span className="activity-time">
                          {formatDate(order.orderDate)}
                        </span>
                      </div>
                      <div className={`activity-status ${order.status}`}>
                        {order.status}
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