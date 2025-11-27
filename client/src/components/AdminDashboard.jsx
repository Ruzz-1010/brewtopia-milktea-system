// AdminDashboard.jsx - COMPLETE WORKING VERSION
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const API_URL = 'https://brewtopia-backend.onrender.com';

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Milk Tea',
    image: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);

  // Load all data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load products
      const productsRes = await axios.get(`${API_URL}/api/products`);
      setProducts(productsRes.data || []);

      // Load orders
      try {
        const ordersRes = await axios.get(`${API_URL}/api/orders`);
        setOrders(ordersRes.data || []);
      } catch (error) {
        console.log('Orders load error:', error);
        setOrders([]);
      }

      // Load users  
      try {
        const usersRes = await axios.get(`${API_URL}/api/users`);
        setUsers(usersRes.data || []);
      } catch (error) {
        console.log('Users load error:', error);
        setUsers([]);
      }

    } catch (error) {
      console.log('Main data load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ADD PRODUCT - WORKING
  const addProduct = async (e) => {
    e.preventDefault();
    
    if (!newProduct.name || !newProduct.price) {
      alert('Please fill in name and price');
      return;
    }

    try {
      const productData = {
        name: newProduct.name,
        price: Number(newProduct.price),
        description: newProduct.description || 'Delicious bubble tea',
        category: newProduct.category,
        image: newProduct.image || 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=300&fit=crop',
        customizations: {
          sizes: [
            { name: "Regular", price: 0 },
            { name: "Large", price: 20 }
          ],
          sugarLevels: ["0%", "25%", "50%", "75%", "100%"],
          iceLevels: ["No Ice", "Less Ice", "Regular Ice"]
        }
      };

      console.log('Adding product:', productData);

      let response;
      try {
        // Try admin endpoint first
        response = await axios.post(`${API_URL}/api/admin/products`, productData);
      } catch (adminError) {
        console.log('Admin endpoint failed, trying regular endpoint...');
        // Fallback to regular endpoint
        response = await axios.post(`${API_URL}/api/products`, productData);
      }

      console.log('Product added successfully:', response.data);
      
      // Reset and reload
      setNewProduct({
        name: '',
        price: '',
        description: '',
        category: 'Milk Tea',
        image: ''
      });
      setShowProductForm(false);
      loadData();
      
      alert('✅ Product added successfully!');

    } catch (error) {
      console.error('Error adding product:', error);
      alert('❌ Error adding product: ' + (error.response?.data?.message || error.message));
    }
  };

  // EDIT PRODUCT - WORKING
  const startEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      image: product.image
    });
    setShowProductForm(true);
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    
    if (!newProduct.name || !newProduct.price) {
      alert('Please fill in name and price');
      return;
    }

    try {
      const productData = {
        name: newProduct.name,
        price: Number(newProduct.price),
        description: newProduct.description,
        category: newProduct.category,
        image: newProduct.image
      };

      console.log('Updating product:', editingProduct._id, productData);

      let response;
      try {
        response = await axios.put(`${API_URL}/api/admin/products/${editingProduct._id}`, productData);
      } catch (adminError) {
        response = await axios.put(`${API_URL}/api/products/${editingProduct._id}`, productData);
      }

      console.log('Product updated successfully:', response.data);
      
      setEditingProduct(null);
      setShowProductForm(false);
      loadData();
      
      alert('✅ Product updated successfully!');

    } catch (error) {
      console.error('Error updating product:', error);
      alert('❌ Error updating product: ' + (error.response?.data?.message || error.message));
    }
  };

  // DELETE PRODUCT - WORKING
  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      console.log('Deleting product:', productId);
      
      try {
        await axios.delete(`${API_URL}/api/admin/products/${productId}`);
      } catch (adminError) {
        await axios.delete(`${API_URL}/api/products/${productId}`);
      }

      loadData();
      alert('✅ Product deleted successfully!');

    } catch (error) {
      console.error('Error deleting product:', error);
      alert('❌ Error deleting product: ' + (error.response?.data?.message || error.message));
    }
  };

  // UPDATE ORDER STATUS - WORKING
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log('Updating order status:', orderId, newStatus);
      
      try {
        await axios.put(`${API_URL}/api/admin/orders/${orderId}/status`, { status: newStatus });
      } catch (adminError) {
        await axios.put(`${API_URL}/api/orders/${orderId}/status`, { status: newStatus });
      }

      loadData();
      
    } catch (error) {
      console.error('Error updating order:', error);
      alert('❌ Error updating order status');
    }
  };

  // UPDATE USER ROLE - WORKING
  const updateUserRole = async (userId, newRole) => {
    try {
      console.log('Updating user role:', userId, newRole);
      
      await axios.put(`${API_URL}/api/admin/users/${userId}/role`, { role: newRole });
      loadData();
      alert('✅ User role updated!');
      
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('❌ Error updating user role');
    }
  };

  // DELETE USER - WORKING
  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      console.log('Deleting user:', userId);
      
      await axios.delete(`${API_URL}/api/admin/users/${userId}`);
      loadData();
      alert('✅ User deleted successfully!');

    } catch (error) {
      console.error('Error deleting user:', error);
      alert('❌ Error deleting user');
    }
  };

  // CALCULATIONS
  const totalRevenue = orders
    .filter(order => order.status === 'completed' || order.status === 'ready')
    .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const customerUsers = users.filter(user => user.role === 'customer').length;
  const adminUsers = users.filter(user => user.role === 'admin').length;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="bubble-tea-spinner">
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
        </div>
        <h2>Loading Dashboard... 🧋</h2>
        <p>Please wait while we load your data</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Product Form Modal */}
      {showProductForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button 
                onClick={() => {
                  setShowProductForm(false);
                  setEditingProduct(null);
                  setNewProduct({
                    name: '',
                    price: '',
                    description: '',
                    category: 'Milk Tea',
                    image: ''
                  });
                }}
                className="close-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingProduct ? updateProduct : addProduct}>
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="e.g., Classic Milk Tea"
                  required
                />
              </div>

              <div className="form-group">
                <label>Price (₱) *</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  placeholder="120"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                >
                  <option value="Milk Tea">Milk Tea</option>
                  <option value="Fruit Tea">Fruit Tea</option>
                  <option value="Coffee">Coffee</option>
                  <option value="Specialty">Specialty</option>
                  <option value="Seasonal">Seasonal</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  placeholder="Describe your product..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Image URL (optional)</label>
                <input
                  type="url"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
                {newProduct.image && (
                  <div className="image-preview">
                    <img src={newProduct.image} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                  }}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-save"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="admin-header">
        <h1>🧋 Brewtopia Admin</h1>
        <button onClick={loadData} className="refresh-btn">
          🔄 Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        {['dashboard', 'products', 'orders', 'users'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'orders' && pendingOrders > 0 && (
              <span className="tab-badge">{pendingOrders}</span>
            )}
            {tab === 'products' && (
              <span className="tab-badge">{products.length}</span>
            )}
            {tab === 'users' && (
              <span className="tab-badge">{users.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="main-content">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-tab">
            <h2>Dashboard Overview</h2>
            
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🥤</div>
                <div className="stat-number">{products.length}</div>
                <div className="stat-label">Total Products</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🛒</div>
                <div className="stat-number">{orders.length}</div>
                <div className="stat-label">Total Orders</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-number">₱{totalRevenue.toLocaleString()}</div>
                <div className="stat-label">Total Revenue</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-number">{users.length}</div>
                <div className="stat-label">Total Users</div>
                <div className="stat-subtext">{customerUsers} customers, {adminUsers} admins</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="action-section">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button 
                  onClick={() => setShowProductForm(true)}
                  className="action-btn primary"
                >
                  + Add New Product
                </button>
                <button onClick={loadData} className="action-btn secondary">
                  🔄 Refresh Data
                </button>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="recent-section">
              <div className="section-header">
                <h3>Recent Orders</h3>
                <span className="pending-count">{pendingOrders} pending</span>
              </div>

              {orders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🛒</div>
                  <p>No orders yet</p>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.slice(0, 5).map(order => (
                    <div key={order._id} className="order-item">
                      <div className="order-info">
                        <div className="order-main">
                          <strong>Order #{order.orderNumber || order._id?.slice(-6)}</strong>
                          <span>{order.customer?.name || 'N/A'}</span>
                        </div>
                        <div className="order-details">
                          <span className="amount">₱{order.totalAmount || 0}</span>
                          <span className="date">{formatDate(order.orderDate)}</span>
                        </div>
                      </div>
                      <select 
                        value={order.status || 'pending'}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="confirmed">✅ Confirmed</option>
                        <option value="preparing">👨‍🍳 Preparing</option>
                        <option value="ready">🥤 Ready</option>
                        <option value="completed">📦 Completed</option>
                        <option value="cancelled">❌ Cancelled</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="products-tab">
            <div className="tab-header">
              <h2>Product Management</h2>
              <button 
                onClick={() => setShowProductForm(true)}
                className="add-product-btn"
              >
                + Add New Product
              </button>
            </div>

            {products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🧋</div>
                <h3>No Products Yet</h3>
                <p>Start by adding your first product to the menu!</p>
                <button 
                  onClick={() => setShowProductForm(true)}
                  className="cta-button"
                >
                  + Add Your First Product
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {products.map(product => (
                  <div key={product._id} className="product-card">
                    <div className="product-image">
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <div className="image-placeholder">🧋</div>
                      )}
                      <div className="product-badge">{product.category}</div>
                    </div>
                    
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="product-description">
                        {product.description || 'No description available'}
                      </p>
                      <div className="product-meta">
                        <span className="product-price">₱{product.price}</span>
                        <span className="product-category">{product.category}</span>
                      </div>
                    </div>
                    
                    <div className="product-actions">
                      <button 
                        onClick={() => startEditProduct(product)}
                        className="btn-edit"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => deleteProduct(product._id)}
                        className="btn-delete"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="orders-tab">
            <div className="tab-header">
              <h2>Order Management ({orders.length} orders)</h2>
            </div>

            {orders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🛒</div>
                <h3>No Orders Yet</h3>
                <p>Orders will appear here when customers place them</p>
              </div>
            ) : (
              <div className="orders-table">
                <div className="table-header">
                  <div>Order #</div>
                  <div>Customer</div>
                  <div>Items</div>
                  <div>Total</div>
                  <div>Status</div>
                  <div>Date</div>
                </div>
                <div className="table-body">
                  {orders.map(order => (
                    <div key={order._id} className="table-row">
                      <div className="order-number">
                        #{order.orderNumber || order._id?.slice(-6)}
                      </div>
                      <div className="customer">
                        {order.customer?.name || 'N/A'}
                        {order.customer?.email && (
                          <div className="customer-email">{order.customer.email}</div>
                        )}
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

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="users-tab">
            <div className="tab-header">
              <h2>User Management ({users.length} users)</h2>
            </div>

            {users.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No Users Found</h3>
                <p>Users will appear here when they register</p>
              </div>
            ) : (
              <div className="users-table">
                <div className="table-header">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Phone</div>
                  <div>Role</div>
                  <div>Joined</div>
                  <div>Actions</div>
                </div>
                <div className="table-body">
                  {users.map(user => (
                    <div key={user._id} className="table-row">
                      <div className="user-name">
                        <strong>{user.name}</strong>
                      </div>
                      <div className="user-email">{user.email}</div>
                      <div className="user-phone">{user.phone || 'N/A'}</div>
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
                      <div className="user-actions">
                        <button 
                          onClick={() => deleteUser(user._id)}
                          className="btn-delete"
                          disabled={user.role === 'admin'}
                          title={user.role === 'admin' ? 'Cannot delete admin users' : 'Delete user'}
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
      </div>
    </div>
  );
}

export default AdminDashboard;