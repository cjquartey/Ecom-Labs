const express = require('express');
const CartController = require('../controllers/cartController');
const Core = require('../settings/core');

const router = express.Router();
const cartController = new CartController();

// Add to cart (POST /api/cart/add)
router.post('/add', Core.requireLogin, async (req, res) => {
    try {
        const cartData = {
            product_id: req.body.product_id,
            customer_id: req.session.user.id,
            qty: req.body.qty || 1,
            ip_address: req.ip
        };

        const result = await cartController.addToCart(cartData);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Add to cart route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get user cart (GET /api/cart)
router.get('/', Core.requireLogin, async (req, res) => {
    try {
        const customerId = req.session.user.id;
        const result = await cartController.getUserCart(customerId);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Get cart route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Update cart quantity (PUT /api/cart/update)
router.put('/update', Core.requireLogin, async (req, res) => {
    try {
        const productId = req.body.product_id;
        const customerId = req.session.user.id;
        const qty = req.body.qty;

        const result = await cartController.updateCartQuantity(productId, customerId, qty);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Update cart route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Remove from cart (DELETE /api/cart/remove)
router.delete('/remove', Core.requireLogin, async (req, res) => {
    try {
        const productId = req.body.product_id;
        const customerId = req.session.user.id;

        const result = await cartController.removeFromCart(productId, customerId);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Remove from cart route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Empty cart (DELETE /api/cart/empty)
router.delete('/empty', Core.requireLogin, async (req, res) => {
    try {
        const customerId = req.session.user.id;
        const result = await cartController.emptyCart(customerId);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Empty cart route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get cart count (GET /api/cart/count)
router.get('/count', Core.requireLogin, async (req, res) => {
    try {
        const customerId = req.session.user.id;
        const result = await cartController.getCartCount(customerId);
        
        res.status(200).json(result);

    } catch (error) {
        console.error('Get cart count route error:', error);
        res.status(500).json({
            success: false,
            count: 0
        });
    }
});

module.exports = router;