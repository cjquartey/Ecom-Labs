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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/products', productRoutes);

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


