const express = require('express');
const CustomerController = require('../controllers/customerController');
const SessionManager = require('../settings/sessionManager');

const router = express.Router();
const customerController = new CustomerController();

// Login customer route
router.post('/login', async (req, res) => {
    try {
        const loginData = {
            email: req.body.email,
            password: req.body.password
        };

        const result = await customerController.loginCustomer(loginData);
        
        if (result.success) {
            // Create session for logged-in user
            const sessionUser = SessionManager.createUserSession(req, result.customer);
            
            res.status(200).json({
                success: true,
                message: result.message,
                user: sessionUser,
                redirectUrl: '/'
            });
        } else {
            res.status(401).json(result);
        }

    } catch (error) {
        console.error('Login route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Logout route
router.post('/logout', async (req, res) => {
    try {
        if (SessionManager.isLoggedIn(req)) {
            await SessionManager.destroySession(req);
            res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'No active session found'
            });
        }
    } catch (error) {
        console.error('Logout route error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
});

// Get current user route
router.get('/user', (req, res) => {
    const user = SessionManager.getCurrentUser(req);
    
    if (user) {
        res.status(200).json({
            success: true,
            user: user,
            isLoggedIn: true
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Not authenticated',
            isLoggedIn: false
        });
    }
});

// Check authentication status route
router.get('/status', (req, res) => {
    const isLoggedIn = SessionManager.isLoggedIn(req);
    const user = SessionManager.getCurrentUser(req);
    
    res.status(200).json({
        success: true,
        isLoggedIn: isLoggedIn,
        user: user || null
    });
});

// Register customer route
router.post('/register', async (req, res) => {
    try {
        const customerData = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            country: req.body.country,
            city: req.body.city,
            phone_number: req.body.phone_number,
            role: req.body.role
        };

        const result = await customerController.registerCustomer(customerData);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Registration route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Check email availability route
router.post('/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const result = await customerController.checkEmailAvailability(email);
        res.status(200).json(result);

    } catch (error) {
        console.error('Email check route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get customer by ID route
router.get('/customer/:id', async (req, res) => {
    try {
        const customerId = req.params.id;
        const result = await customerController.getCustomerById(customerId);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }

    } catch (error) {
        console.error('Get customer route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Update customer route
router.put('/customer/:id', async (req, res) => {
    try {
        const customerId = req.params.id;
        const updateData = req.body;
        
        const result = await customerController.updateCustomer(customerId, updateData);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Update customer route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Delete customer route
router.delete('/customer/:id', async (req, res) => {
    try {
        const customerId = req.params.id;
        const result = await customerController.deleteCustomer(customerId);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }

    } catch (error) {
        console.error('Delete customer route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
