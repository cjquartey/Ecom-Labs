const express = require('express');
const CustomerController = require('../controllers/customerController');

const router = express.Router();
const customerController = new CustomerController();

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