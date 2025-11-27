// AdminDashboard.jsx - Modern Redesign
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

  // ORDER MANAGEMENT
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      try {
        await axios.put(`${API_URL}/api/admin/orders/${orderId}/status`, {
          status: newStatus
        });
      } catch (adminError) {
        await axios.put(`${API_URL}/api/orders/${orderId}/status`, {
          status: newStatus
        });
      }
      showNotification('Order status updated!');
      loadDashboardData();
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
      image: '',
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
    setLoading(true);
    
    try {
      const productData = {
        name: productForm.name,
        price: Number(productForm.price),
        image: productForm.image,
        description: productForm.description,
        category: productForm.category,
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
      showNotification('Error saving product. Please try again.');
    } finally {
      setLoading(false);
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

  // USER MANAGEMENT FUNCTIONS
  const updateUserRole = async (userId, newRole) => {
    try {
      await axios.put(`${API_URL}/api/admin/users/${userId}/role`, {
        role: newRole
      });
      showNotification('User role updated!');
      loadDashboardData();
    } catch (error) {
      console.error('Error updating user role:', error);
      showNotification('Error updating user role');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API_URL}/api/admin/users/${userId}`);
        showNotification('User deleted successfully!');
        loadDashboardData();
      } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Error deleting user');
      }
    }
  };

  // UTILITY FUNCTIONS
  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      preparing: '#8b5cf6',
      ready: '#10b981',
      completed: '#059669',
      cancelled: '#ef4444'
    };
    return colors[status] || '#64748b';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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

  const getTotalCustomers = () => {
    return users.filter(user => user.role === 'customer').length;
  };

  const getTotalAdmins = () => {
    return users.filter(user => user.role === 'admin').length;
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
          <h1>🧋 Brewtopia Admin</h1>
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
                  step="0.01"
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
                      }}
                    />
                  </div>
                </div>
              )}
              
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
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
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
          {loading && (
            <div className="loading-overlay">
              <div className="bubble-tea-spinner">
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
              </div>
              <p>Loading data...</p>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-content">
              <div className="page-header">
                <h1>Dashboard Overview</h1>
                <p>Welcome to your business management panel</p>
              </div>

              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🥤</div>
                  <div className="stat-content">
                    <h3>Total Products</h3>
                    <div className="stat-number">{products.length}</div>
                    <p className="stat-description">Active menu items</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🛒</div>
                  <div className="stat-content">
                    <h3>Total Orders</h3>
                    <div className="stat-number">{orders.length}</div>
                    <p className="stat-description">All time orders</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <h3>Revenue</h3>
                    <div className="stat-number">₱{calculateRevenue().toLocaleString()}</div>
                    <p className="stat-description">Total sales</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-content">
                    <h3>Total Users</h3>
                    <div className="stat-number">{users.length}</div>
                    <p className="stat-description">{getTotalCustomers()} customers, {getTotalAdmins()} admins</p>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
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

                {orders.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🛒</div>
                    <h3>No orders yet</h3>
                    <p>Orders will appear here when customers place them.</p>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orders.slice(0, 5).map(order => (
                      <div key={order._id} className="order-item">
                        <div className="order-info">
                          <div className="order-main">
                            <h4>Order #{order.orderNumber || order._id?.slice(-6)}</h4>
                            <span className="customer">{order.customer?.name || 'N/A'}</span>
                          </div>
                          <div className="order-details">
                            <span className="amount">₱{order.totalAmount || 0}</span>
                            <span className="date">{formatDate(order.orderDate)}</span>
                          </div>
                        </div>
                        <div className="order-actions">
                          <select 
                            value={order.status || 'pending'}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className="status-select"
                            style={{ borderColor: getStatusColor(order.status) }}
                          >
                            <option value="pending">⏳ Pending</option>
                            <option value="confirmed">✅ Confirmed</option>
                            <option value="preparing">👨‍🍳 Preparing</option>
                            <option value="ready">🥤 Ready</option>
                            <option value="completed">📦 Completed</option>
                            <option value="cancelled">❌ Cancelled</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="products-content">
              <div className="page-header">
                <div className="header-content">
                  <h1>Product Management</h1>
                  <p>Manage your bubble tea menu ({products.length} products)</p>
                </div>
                <div className="header-actions">
                  <button className="btn-primary" onClick={handleAddProduct}>
                    <span>➕</span>
                    Add Product
                  </button>
                  <button className="btn-secondary" onClick={loadDashboardData}>
                    <span>🔄</span>
                    Refresh
                  </button>
                </div>
              </div>

              <div className="products-grid">
                {products.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🧋</div>
                    <h3>No products yet</h3>
                    <p>Start by adding your first bubble tea product!</p>
                    <button className="btn-primary" onClick={handleAddProduct}>
                      Add Your First Product
                    </button>
                  </div>
                ) : (
                  products.map(product => (
                    <div key={product._id} className="product-card">
                      <div className="product-image">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="product-img"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="image-fallback" style={{display: product.image ? 'none' : 'flex'}}>
                          🧋
                        </div>
                        <div className="product-badge">{product.category}</div>
                      </div>
                      <div className="product-info">
                        <h3>{product.name}</h3>
                        <p className="product-description">{product.description}</p>
                        <div className="product-meta">
                          <span className="product-price">₱{product.price}</span>
                          <span className="product-category-tag">{product.category}</span>
                        </div>
                      </div>
                      <div className="product-actions">
                        <button 
                          className="btn-edit" 
                          onClick={() => handleEditProduct(product)}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="btn-delete"
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

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="orders-content">
              <div className="page-header">
                <div className="header-content">
                  <h1>Order Management</h1>
                  <p>Manage customer orders ({orders.length} total)</p>
                </div>
                <div className="header-actions">
                  <button className="btn-primary" onClick={loadDashboardData}>
                    <span>🔄</span>
                    Refresh
                  </button>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🛒</div>
                  <h3>No orders yet</h3>
                  <p>Orders will appear here when customers place them.</p>
                </div>
              ) : (
                <div className="orders-table">
                  <div className="table-header">
                    <div className="table-row">
                      <div>Order #</div>
                      <div>Customer</div>
                      <div>Items</div>
                      <div>Total</div>
                      <div>Status</div>
                      <div>Date</div>
                    </div>
                  </div>
                  <div className="table-body">
                    {orders.map(order => (
                      <div key={order._id} className="table-row">
                        <div className="order-number">
                          <strong>#{order.orderNumber || order._id?.slice(-6)}</strong>
                        </div>
                        <div className="customer">
                          <div className="customer-name">{order.customer?.name || 'N/A'}</div>
                          <div className="customer-contact">{order.customer?.email || order.customer?.phone || ''}</div>
                        </div>
                        <div className="items">
                          {order.items?.length || 0} items
                        </div>
                        <div className="total">
                          ₱{order.totalAmount || 0}
                        </div>
                        <div className="status">
                          <select 
                            value={order.status || 'pending'}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className="status-select"
                            style={{ borderColor: getStatusColor(order.status) }}
                          >
                            <option value="pending">⏳ Pending</option>
                            <option value="confirmed">✅ Confirmed</option>
                            <option value="preparing">👨‍🍳 Preparing</option>
                            <option value="ready">🥤 Ready</option>
                            <option value="completed">📦 Completed</option>
                            <option value="cancelled">❌ Cancelled</option>
                          </select>
                        </div>
                        <div className="date">
                          {formatDate(order.orderDate)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="users-content">
              <div className="page-header">
                <div className="header-content">
                  <h1>User Management</h1>
                  <p>Manage system users ({users.length} total)</p>
                </div>
                <div className="header-actions">
                  <button className="btn-primary" onClick={loadDashboardData}>
                    <span>🔄</span>
                    Refresh
                  </button>
                </div>
              </div>

              {users.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <h3>No users found</h3>
                  <p>Users will appear here when they register.</p>
                </div>
              ) : (
                <div className="users-table">
                  <div className="table-header">
                    <div className="table-row">
                      <div>Name</div>
                      <div>Email</div>
                      <div>Phone</div>
                      <div>Role</div>
                      <div>Joined</div>
                      <div>Actions</div>
                    </div>
                  </div>
                  <div className="table-body">
                    {users.map(user => (
                      <div key={user._id} className="table-row">
                        <div className="user-name">
                          <strong>{user.name}</strong>
                        </div>
                        <div className="user-email">
                          {user.email}
                        </div>
                        <div className="user-phone">
                          {user.phone || 'N/A'}
                        </div>
                        <div className="user-role">
                          <select 
                            value={user.role}
                            onChange={(e) => updateUserRole(user._id, e.target.value)}
                            className="role-select"
                          >
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <div className="user-joined">
                          {formatDate(user.createdAt)}
                        </div>
                        <div className="actions">
                          <button 
                            className="btn-delete"
                            onClick={() => deleteUser(user._id)}
                            disabled={user.role === 'admin'}
                            style={{opacity: user.role === 'admin' ? 0.5 : 1}}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;