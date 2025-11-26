import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const API_URL = 'https://brewtopia-backend.onrender.com';

function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, ordersRes, analyticsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/dashboard`),
        axios.get(`${API_URL}/api/admin/orders?limit=5`),
        axios.get(`${API_URL}/api/admin/analytics`)
      ]);
      
      setStats(statsRes.data);
      setOrders(ordersRes.data.orders);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/admin/orders/${orderId}/status`, {
        status: newStatus
      });
      loadDashboardData(); // Reload data
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <h1>🧋 Brewtopia Admin Panel</h1>
        <div className="admin-nav">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button 
            className={activeTab === 'analytics' ? 'active' : ''}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>
      </header>

      <div className="admin-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-tab">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Orders</h3>
                <div className="stat-number">{stats.totalOrders || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Pending Orders</h3>
                <div className="stat-number pending">{stats.pendingOrders || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Today's Orders</h3>
                <div className="stat-number">{stats.todayOrders || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Total Revenue</h3>
                <div className="stat-number revenue">₱{stats.totalRevenue || 0}</div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="recent-orders">
              <h2>Recent Orders</h2>
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order._id} className="order-item">
                    <div className="order-info">
                      <strong>Order #{order.orderNumber}</strong>
                      <span>{order.customer?.name}</span>
                      <span>₱{order.totalAmount}</span>
                    </div>
                    <div className="order-actions">
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className={`status-select ${order.status}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-tab">
            <h2>All Orders</h2>
            <div className="orders-table">
              <div className="table-header">
                <span>Order #</span>
                <span>Customer</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Date</span>
                <span>Actions</span>
              </div>
              {orders.map(order => (
                <div key={order._id} className="table-row">
                  <span>#{order.orderNumber}</span>
                  <span>{order.customer?.name}</span>
                  <span>₱{order.totalAmount}</span>
                  <span>
                    <select 
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className={`status-select ${order.status}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="completed">Completed</option>
                    </select>
                  </span>
                  <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                  <span>
                    <button className="view-btn">View</button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <h2>Sales Analytics</h2>
            
            {/* Popular Products */}
            <div className="analytics-section">
              <h3>Popular Products</h3>
              <div className="products-list">
                {analytics.popularProducts?.map((product, index) => (
                  <div key={index} className="product-rank">
                    <span>{index + 1}. {product._id}</span>
                    <span>Sold: {product.totalSold}</span>
                    <span>Revenue: ₱{product.revenue}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Sales */}
            <div className="analytics-section">
              <h3>Last 7 Days Sales</h3>
              <div className="sales-chart">
                {analytics.dailySales?.map(day => (
                  <div key={day._id} className="chart-bar">
                    <div className="bar-label">{day._id}</div>
                    <div 
                      className="bar-fill" 
                      style={{ height: `${(day.total / 1000) * 2}px` }}
                    ></div>
                    <div className="bar-value">₱{day.total}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;