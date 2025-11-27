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
      const productsRes = await axios.get(`${API_URL}/api/products`);
      setProducts(productsRes.data);
      
      // Try to load orders if endpoint exists
      try {
        const ordersRes = await axios.get(`${API_URL}/api/orders`);
        setOrders(ordersRes.data.orders || ordersRes.data || []);
      } catch (orderError) {
        console.log('Orders endpoint not available');
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // PRODUCT MANAGEMENT - SIMPLIFIED
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
        category: productForm.category
      };

      if (editingProduct) {
        // Update existing product
        await axios.put(`${API_URL}/api/products/${editingProduct._id}`, productData);
        showNotification('Product updated successfully!');
      } else {
        // Add new product
        await axios.post(`${API_URL}/api/products`, productData);
        showNotification('Product added successfully!');
      }
      
      setShowProductForm(false);
      loadDashboardData();
    } catch (error) {
      console.error('Error saving product:', error);
      showNotification('Error saving product: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_URL}/api/products/${productId}`);
        showNotification('Product deleted successfully!');
        loadDashboardData();
      } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product');
      }
    }
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
                  step="0.01"
                />
              </div>
              
              <div className="form-group">
                <label>Product Image URL</label>
                <input
                  type="url"
                  value={productForm.image}
                  onChange={(e) => setProductForm({...productForm, image: e.target.value})}
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
            </button>

            <button 
              className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }}
            >
              <span className="nav-icon">🥤</span>
              <span className="nav-text">Products</span>
              <span className="nav-badge">{products.length}</span>
            </button>
          </nav>
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
                <p>Business management panel</p>
              </div>

              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-content">
                    <h3>Total Products</h3>
                    <div className="stat-number">{products.length}</div>
                    <p className="stat-description">Available items</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-content">
                    <h3>Total Orders</h3>
                    <div className="stat-number">{orders.length}</div>
                    <p className="stat-description">All orders</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-content">
                    <h3>Revenue</h3>
                    <div className="stat-number">₱{calculateRevenue().toLocaleString()}</div>
                    <p className="stat-description">Total sales</p>
                  </div>
                </div>
              </div>

              {/* Recent Products */}
              <div className="activity-section">
                <div className="section-header">
                  <h2>Recent Products</h2>
                  <button 
                    className="view-all-btn"
                    onClick={() => setActiveTab('products')}
                  >
                    View All Products
                  </button>
                </div>

                <div className="products-list">
                  {products.slice(0, 5).map(product => (
                    <div key={product._id} className="product-item">
                      <img src={product.image} alt={product.name} className="product-thumb" />
                      <div className="product-details">
                        <h4>{product.name}</h4>
                        <p>₱{product.price} • {product.category}</p>
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
                  <p>Manage your menu ({products.length} products)</p>
                </div>
                <div className="header-actions">
                  <button className="btn-primary" onClick={handleAddProduct}>
                    ➕ Add Product
                  </button>
                  <button className="btn-secondary" onClick={loadDashboardData}>
                    🔄 Refresh
                  </button>
                </div>
              </div>

              <div className="products-grid">
                {products.length === 0 ? (
                  <div className="empty-state">
                    <h3>No products yet</h3>
                    <p>Click "Add Product" to create your first menu item!</p>
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
                          />
                        ) : (
                          <div className="image-placeholder">🧋</div>
                        )}
                      </div>
                      <div className="product-info">
                        <h3>{product.name}</h3>
                        <p className="product-description">{product.description}</p>
                        <div className="product-meta">
                          <span className="product-price">₱{product.price}</span>
                          <span className="product-category">{product.category}</span>
                        </div>
                      </div>
                      <div className="product-actions">
                        <button 
                          className="btn-edit" 
                          onClick={() => handleEditProduct(product)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => deleteProduct(product._id)}
                        >
                          Delete
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
                  <p>Customer orders</p>
                </div>
                <div className="header-actions">
                  <button className="btn-primary" onClick={loadDashboardData}>
                    🔄 Refresh
                  </button>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="empty-state">
                  <h3>No orders yet</h3>
                  <p>Orders will appear here when customers place them.</p>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map(order => (
                    <div key={order._id} className="order-card">
                      <div className="order-header">
                        <h4>Order #{order.orderNumber || order._id}</h4>
                        <span className="order-date">{formatDate(order.orderDate)}</span>
                      </div>
                      <div className="order-details">
                        <p><strong>Customer:</strong> {order.customer?.name || 'N/A'}</p>
                        <p><strong>Total:</strong> ₱{order.totalAmount}</p>
                        <p><strong>Status:</strong> 
                          <span className={`status-badge ${order.status}`}>
                            {order.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
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