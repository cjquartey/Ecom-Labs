const express = require('express');
const OrderController = require('../controllers/orderController');
const CartController = require('../controllers/cartController');
const Core = require('../settings/core');

const router = express.Router();
const orderController = new OrderController();
const cartController = new CartController();

// Process checkout (POST /api/orders/checkout)
router.post('/checkout', Core.requireLogin, async (req, res) => {
    try {
        const customerId = req.session.user.id;
        
        // Get user's cart
        const cartResult = await cartController.getUserCart(customerId);
        
        if (!cartResult.success || cartResult.cart_items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Your cart is empty'
            });
        }

        // Calculate total amount
        let totalAmount = 0;
        cartResult.cart_items.forEach(item => {
            totalAmount += parseFloat(item.product_price) * parseInt(item.qty);
        });

        // Create order
        const orderResult = await orderController.createOrder({
            customer_id: customerId,
            status: 'Pending'
        });

        if (!orderResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create order'
            });
        }

        const orderId = orderResult.order_id;
        const invoiceNo = orderResult.invoice_no;

        // Add order details for each cart item
        for (const item of cartResult.cart_items) {
            await orderController.addOrderDetails({
                order_id: orderId,
                product_id: item.p_id,
                qty: item.qty
            });
        }

        // Record payment
        const paymentResult = await orderController.recordPayment({
            amount: totalAmount,
            customer_id: customerId,
            order_id: orderId,
            currency: 'USD'
        });

        if (!paymentResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to record payment'
            });
        }

        // Empty cart after successful checkout
        await cartController.emptyCart(customerId);

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Order placed successfully',
            order_id: orderId,
            invoice_no: invoiceNo,
            total_amount: totalAmount.toFixed(2),
            currency: 'USD'
        });

    } catch (error) {
        console.error('Checkout route error:', error);
        res.status(500).json({
            success: false,
            message: 'Checkout failed. Please try again.'
        });
    }
});

// Get user orders (GET /api/orders)
router.get('/', Core.requireLogin, async (req, res) => {
    try {
        const customerId = req.session.user.id;
        const result = await orderController.getUserOrders(customerId);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Get orders route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get order details (GET /api/orders/:id)
router.get('/:id', Core.requireLogin, async (req, res) => {
    try {
        const orderId = req.params.id;
        const customerId = req.session.user.id;
        
        const result = await orderController.getOrderById(orderId, customerId);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }

    } catch (error) {
        console.error('Get order details route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;