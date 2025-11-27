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
  const [message, setMessage] = useState('');
  
  // Form states
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
    category: 'Milk Tea'
  });

  // Sample images for quick selection
  const sampleImages = [
    'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1525385133512-2f3bdd24ac30?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=300&fit=crop'
  ];

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
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/dashboard`),
        axios.get(`${API_URL}/api/admin/orders?limit=20`),
        axios.get(`${API_URL}/api/admin/products`)
      ]);
      
      setStats(statsRes.data);
      setOrders(ordersRes.data.orders || []);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
      // If admin products fail, try regular products endpoint
      try {
        const productsRes = await axios.get(`${API_URL}/api/products`);
        setProducts(productsRes.data);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  // ORDER MANAGEMENT
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/admin/orders/${orderId}/status`, {
        status: newStatus
      });
      loadDashboardData();
      showNotification('Order status updated!');
    } catch (error) {
      console.error('Error updating order:', error);
      showNotification('Error updating order status');
    }
  };

  // PRODUCT MANAGEMENT
  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      price: '',
      image: sampleImages[0],
      description: '',
      category: 'Milk Tea'
    });
    setShowProductForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      category: product.category
    });
    setShowProductForm(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...productForm,
        price: Number(productForm.price),
        customizations: {
          sizes: [
            { name: "Regular", price: 0 },
            { name: "Large", price: 20 },
            { name: "X-Large", price: 30 }
          ],
          sugarLevels: ["0%", "25%", "50%", "75%", "100%"],
          iceLevels: ["No Ice", "Less Ice", "Regular Ice"],
          addons: [
            { name: "Pearls", price: 15 },
            { name: "Pudding", price: 20 },
            { name: "Whip Cream", price: 25 }
          ]
        }
      };

      if (editingProduct) {
        await axios.put(`${API_URL}/api/admin/products/${editingProduct._id}`, productData);
        showNotification('Product updated successfully!');
      } else {
        await axios.post(`${API_URL}/api/admin/products`, productData);
        showNotification('Product added successfully!');
      }
      
      setShowProductForm(false);
      loadDashboardData();
    } catch (error) {
      console.error('Error saving product:', error);
      showNotification('Error saving product');
    }
  };

  const deleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_URL}/api/admin/products/${productId}`);
        showNotification('Product deleted successfully!');
        loadDashboardData();
      } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product');
      }
    }
  };

  const handleImageSelect = (imageUrl) => {
    setProductForm({...productForm, image: imageUrl});
  };

  // UTILITY FUNCTIONS
  const getStatusColor = (status) => {
    const colors = {
      pending: '#b18f6a',
      confirmed: '#a67b5b',
      preparing: '#8a624a',
      ready: '#765640',
      completed: '#5d4037',
      cancelled: '#ccae88'
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

  const getOrderCountByStatus = (status) => {
    return orders.filter(order => order.status === status).length;
  };

  return (
    <div className="admin-dashboard">
      {/* Notification */}
      {message && (
        <div className="notification">
          {message}
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
          <span>Admin</span>
        </div>
        <button className="refresh-btn" onClick={loadDashboardData}>
          🔄
        </button>
      </header>

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="close-btn" onClick={() => setShowProductForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveProduct} className="product-form">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  required
                  placeholder="e.g., Classic Milk Tea"
                />
              </div>
              
              <div className="form-group">
                <label>Price (₱) *</label>
                <input
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  required
                  placeholder="120"
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label>Product Image URL *</label>
                <input
                  type="url"
                  value={productForm.image}
                  onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                  required
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Image Preview */}
              {productForm.image && (
                <div className="image-preview">
                  <label>Image Preview:</label>
                  <div className="preview-container">
                    <img 
                      src={productForm.image} 
                      alt="Preview" 
                      className="preview-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="preview-fallback" style={{display: 'none'}}>
                      ❌ Invalid Image URL
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Image Selection */}
              <div className="form-group">
                <label>Quick Image Selection:</label>
                <div className="image-options">
                  {sampleImages.map((imageUrl, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`image-option ${productForm.image === imageUrl ? 'selected' : ''}`}
                      onClick={() => handleImageSelect(imageUrl)}
                    >
                      <img src={imageUrl} alt={`Option ${index + 1}`} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  required
                >
                  <option value="Milk Tea">Milk Tea</option>
                  <option value="Fruit Tea">Fruit Tea</option>
                  <option value="Coffee">Coffee</option>
                  <option value="Specialty">Specialty</option>
                  <option value="Seasonal">Seasonal</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  rows="3"
                  placeholder="Describe the taste and ingredients..."
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowProductForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              {getOrderCountByStatus('pending') > 0 && (
                <span className="nav-badge">{getOrderCountByStatus('pending')}</span>
              )}
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
                    <div className="stat-number">{getOrderCountByStatus('pending')}</div>
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
                  <p>Manage your milk tea menu ({products.length} products)</p>
                </div>
                <div className="header-actions">
                  <button className="btn-primary" onClick={handleAddProduct}>
                    ➕ Add Product
                  </button>
                </div>
              </div>

              <div className="products-grid">
                {products.length === 0 ? (
                  <div className="empty-state">
                    <h3>No products yet</h3>
                    <p>Click "Add Product" to create your first milk tea item!</p>
                  </div>
                ) : (
                  products.map(product => (
                    <div key={product._id || product.id} className="product-card">
                      <div className="product-image">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="product-img"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="image-fallback">
                          🧋 No Image
                        </div>
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
                            <span>Sizes: {product.customizations?.sizes?.length || 3}</span>
                          </div>
                          <div className="customization-item">
                            <span>Add-ons: {product.customizations?.addons?.length || 3}</span>
                          </div>
                        </div>
                      </div>
                      <div className="product-actions">
                        <button 
                          className="btn-secondary" 
                          onClick={() => handleEditProduct(product)}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="btn-danger"
                          onClick={() => deleteProduct(product._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
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
                        {getOrderCountByStatus('completed')}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Average Order Value</span>
                      <span className="stat-value">
                        ₱{orders.length > 0 ? (calculateRevenue() / orders.length).toFixed(2) : '0.00'}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Products</span>
                      <span className="stat-value">
                        {products.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="analytics-card">
                  <h3>📈 Order Status Distribution</h3>
                  <div className="status-distribution">
                    <div className="status-item">
                      <span className="status-label">Pending</span>
                      <span className="status-count">{getOrderCountByStatus('pending')}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Preparing</span>
                      <span className="status-count">{getOrderCountByStatus('preparing')}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Ready</span>
                      <span className="status-count">{getOrderCountByStatus('ready')}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Completed</span>
                      <span className="status-count">{getOrderCountByStatus('completed')}</span>
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
                      <div 
                        className="activity-status"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
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