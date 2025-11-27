import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const API_URL = 'https://brewtopia-backend.onrender.com';

function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, ordersRes, analyticsRes, inventoryRes, productsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/dashboard`),
        axios.get(`${API_URL}/api/admin/orders?limit=10`),
        axios.get(`${API_URL}/api/admin/analytics`),
        axios.get(`${API_URL}/api/admin/inventory`),
        axios.get(`${API_URL}/api/admin/products`)
      ]);
      
      setStats(statsRes.data);
      setOrders(ordersRes.data.orders);
      setAnalytics(analyticsRes.data);
      setInventory(inventoryRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
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

  const updateInventory = async (itemId, newStock) => {
    try {
      await axios.put(`${API_URL}/api/admin/inventory/${itemId}`, {
        stock: newStock
      });
      loadDashboardData();
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      await axios.put(`${API_URL}/api/admin/products/${productId}`, {
        active: !currentStatus
      });
      loadDashboardData();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Mobile Header */}
      <header className="admin-header-mobile">
        <button 
          className="menu-toggle"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          ☰
        </button>
        <h1>🧋 Brewtopia</h1>
      </header>

      <div className="admin-layout">
        {/* Sidebar Navigation */}
        <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h2>🧋 Brewtopia</h2>
            <p>Admin Panel</p>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
            >
              📊 Dashboard
            </button>
            <button 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}
            >
              🛒 Orders
            </button>
            <button 
              className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }}
            >
              🥤 Products
            </button>
            <button 
              className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => { setActiveTab('inventory'); setIsSidebarOpen(false); }}
            >
              📦 Inventory
            </button>
            <button 
              className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }}
            >
              📈 Analytics
            </button>
            <button 
              className={`nav-item ${activeTab === 'promos' ? 'active' : ''}`}
              onClick={() => { setActiveTab('promos'); setIsSidebarOpen(false); }}
            >
              🎯 Promos
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-tab">
              <div className="page-header">
                <h1>Dashboard Overview</h1>
                <p>Welcome to Brewtopia Admin Panel</p>
              </div>

              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card primary">
                  <div className="stat-icon">📦</div>
                  <div className="stat-content">
                    <h3>Total Orders</h3>
                    <div className="stat-number">{stats.totalOrders || 0}</div>
                  </div>
                </div>
                <div className="stat-card warning">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-content">
                    <h3>Pending Orders</h3>
                    <div className="stat-number">{stats.pendingOrders || 0}</div>
                  </div>
                </div>
                <div className="stat-card info">
                  <div className="stat-icon">📅</div>
                  <div className="stat-content">
                    <h3>Today's Orders</h3>
                    <div className="stat-number">{stats.todayOrders || 0}</div>
                  </div>
                </div>
                <div className="stat-card success">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <h3>Total Revenue</h3>
                    <div className="stat-number">₱{stats.totalRevenue || 0}</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                  <button className="action-btn" onClick={() => setActiveTab('products')}>
                    <span>➕</span>
                    Add New Product
                  </button>
                  <button className="action-btn" onClick={() => setActiveTab('promos')}>
                    <span>🎯</span>
                    Manage Promos
                  </button>
                  <button className="action-btn" onClick={() => setActiveTab('inventory')}>
                    <span>📦</span>
                    Check Inventory
                  </button>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="recent-orders">
                <div className="section-header">
                  <h2>Recent Orders</h2>
                  <button className="view-all-btn" onClick={() => setActiveTab('orders')}>
                    View All
                  </button>
                </div>
                <div className="orders-list">
                  {orders.slice(0, 5).map(order => (
                    <div key={order._id} className="order-card">
                      <div className="order-header">
                        <strong>Order #{order.orderNumber}</strong>
                        <span className={`status-badge ${order.status}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="order-details">
                        <span>👤 {order.customer?.name}</span>
                        <span>💰 ₱{order.totalAmount}</span>
                        <span>📅 {new Date(order.orderDate).toLocaleDateString()}</span>
                      </div>
                      <div className="order-actions">
                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="status-select"
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
            <div className="orders-tab">
              <div className="page-header">
                <h1>Order Management</h1>
                <p>Manage and track all customer orders</p>
              </div>

              <div className="orders-table-container">
                <div className="table-header">
                  <span>Order #</span>
                  <span>Customer</span>
                  <span>Items</span>
                  <span>Amount</span>
                  <span>Status</span>
                  <span>Date</span>
                  <span>Actions</span>
                </div>
                <div className="table-body">
                  {orders.map(order => (
                    <div key={order._id} className="table-row">
                      <span className="order-number">#{order.orderNumber}</span>
                      <span className="customer">{order.customer?.name}</span>
                      <span className="items">{order.items?.length} items</span>
                      <span className="amount">₱{order.totalAmount}</span>
                      <span className="status">
                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className={`status-select ${order.status}`}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="confirmed">✅ Confirmed</option>
                          <option value="preparing">👨‍🍳 Preparing</option>
                          <option value="ready">🥤 Ready</option>
                          <option value="completed">📦 Completed</option>
                        </select>
                      </span>
                      <span className="date">{new Date(order.orderDate).toLocaleDateString()}</span>
                      <span className="actions">
                        <button className="btn-view">👁️ View</button>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="products-tab">
              <div className="page-header">
                <h1>Product Management</h1>
                <p>Manage your milk tea menu and products</p>
                <button className="btn-primary">➕ Add New Product</button>
              </div>

              <div className="products-grid">
                {products.map(product => (
                  <div key={product._id} className="product-card">
                    <img src={product.image} alt={product.name} className="product-image" />
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="product-description">{product.description}</p>
                      <div className="product-price">₱{product.price}</div>
                      <div className="product-actions">
                        <button className="btn-edit">✏️ Edit</button>
                        <button 
                          className={`btn-status ${product.active ? 'active' : 'inactive'}`}
                          onClick={() => toggleProductStatus(product._id, product.active)}
                        >
                          {product.active ? '✅ Active' : '❌ Inactive'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="inventory-tab">
              <div className="page-header">
                <h1>Inventory Management</h1>
                <p>Track and manage your ingredient stock</p>
              </div>

              <div className="inventory-list">
                {inventory.map(item => (
                  <div key={item._id} className="inventory-item">
                    <div className="item-info">
                      <h3>{item.name}</h3>
                      <p className="item-category">{item.category}</p>
                    </div>
                    <div className="item-stock">
                      <div className="stock-level">
                        <div className={`stock-indicator ${item.stock < item.minStock ? 'low' : 'adequate'}`}>
                          {item.stock} units
                        </div>
                        {item.stock < item.minStock && (
                          <span className="low-stock-warning">⚠️ Low Stock!</span>
                        )}
                      </div>
                      <div className="stock-actions">
                        <button 
                          className="btn-stock"
                          onClick={() => updateInventory(item._id, item.stock + 10)}
                        >
                          ➕ Restock
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="analytics-tab">
              <div className="page-header">
                <h1>Sales Analytics</h1>
                <p>Track your business performance</p>
              </div>

              {/* Popular Products */}
              <div className="analytics-section">
                <h2>🥤 Popular Products</h2>
                <div className="products-ranking">
                  {analytics.popularProducts?.map((product, index) => (
                    <div key={index} className="rank-item">
                      <div className="rank-number">{index + 1}</div>
                      <div className="product-details">
                        <span className="product-name">{product._id}</span>
                        <span className="product-stats">
                          Sold: {product.totalSold} | Revenue: ₱{product.revenue}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Sales */}
              <div className="analytics-section">
                <h2>📈 Last 7 Days Sales</h2>
                <div className="sales-chart">
                  {analytics.dailySales?.map(day => (
                    <div key={day._id} className="chart-bar-container">
                      <div className="bar-label">{day._id}</div>
                      <div 
                        className="chart-bar" 
                        style={{ height: `${(day.total / Math.max(...analytics.dailySales.map(d => d.total))) * 150}px` }}
                      >
                        <div className="bar-value">₱{day.total}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Promos Tab */}
          {activeTab === 'promos' && (
            <div className="promos-tab">
              <div className="page-header">
                <h1>Promotions Management</h1>
                <p>Set up and manage your promotions</p>
                <button className="btn-primary">🎯 Add New Promotion</button>
              </div>

              <div className="promos-grid">
                <div className="promo-card">
                  <h3>🎉 Summer Special</h3>
                  <p>20% off on all fruit teas</p>
                  <div className="promo-details">
                    <span>Valid until: 2024-08-31</span>
                    <span className="status active">Active</span>
                  </div>
                </div>
                <div className="promo-card">
                  <h3>👥 Buy 1 Get 1</h3>
                  <p>Buy any large milk tea, get one regular free</p>
                  <div className="promo-details">
                    <span>Valid until: 2024-07-15</span>
                    <span className="status inactive">Inactive</span>
                  </div>
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