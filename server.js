const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import session manager and routes
const SessionManager = require('./settings/sessionManager');
const authRoutes = require('./actions/authRoutes');
const categoryRoutes = require('./actions/categoryRoutes');
const brandRoutes = require('./actions/brandRoutes');
const productRoutes = require('./actions/productRoutes');
const cartRoutes = require('./actions/cartRoutes');
const orderRoutes = require('./actions/orderRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Session manager instance
const sessionManager = new SessionManager();

// Middleware
app.use(cors({
    origin: `http://localhost:${PORT}`,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(sessionManager.getSessionMiddleware());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '/')));

// Serve uploads directory for product images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'login', 'register.html'));
});

// Serve admin pages
app.get('/admin/category', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'category.html'));
});

app.get('/admin/brand', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'brand.html'));
});

app.get('/admin/product', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'product.html'));
});

// Serve view pages (customer-facing)
app.get('/view/all_products', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'all_products.html'));
});

app.get('/view/single_product', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'single_product.html'));
});

app.get('/view/product_search_result', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'product_search_result.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
