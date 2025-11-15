const database = require('../db/connection');

class Order {
    constructor() {
        this.ordersTable = 'orders';
        this.orderDetailsTable = 'orderdetails';
        this.paymentTable = 'payment';
    }

    // Create new order
    async createOrder(orderData) {
        try {
            const connection = await database.getConnection();
            
            // Generate unique invoice number
            const invoiceNo = Date.now();
            const orderDate = new Date().toISOString().split('T')[0];
            
            const query = `
                INSERT INTO ${this.ordersTable} (customer_id, invoice_no, order_date, order_status) 
                VALUES (?, ?, ?, ?)
            `;
            
            const [result] = await connection.execute(query, [
                orderData.customer_id,
                invoiceNo,
                orderDate,
                orderData.status || 'Pending'
            ]);
            
            return {
                success: true,
                order_id: result.insertId,
                invoice_no: invoiceNo,
                message: 'Order created successfully'
            };

        } catch (error) {
            console.error('Error creating order:', error);
            return {
                success: false,
                message: 'Failed to create order'
            };
        }
    }

    // Add order details
    async addOrderDetails(orderDetailsData) {
        try {
            const connection = await database.getConnection();
            
            const query = `
                INSERT INTO ${this.orderDetailsTable} (order_id, product_id, qty) 
                VALUES (?, ?, ?)
            `;
            
            await connection.execute(query, [
                orderDetailsData.order_id,
                orderDetailsData.product_id,
                orderDetailsData.qty
            ]);
            
            return {
                success: true,
                message: 'Order details added successfully'
            };

        } catch (error) {
            console.error('Error adding order details:', error);
            return {
                success: false,
                message: 'Failed to add order details'
            };
        }
    }

    // Record payment
    async recordPayment(paymentData) {
        try {
            const connection = await database.getConnection();
            const paymentDate = new Date().toISOString().split('T')[0];
            
            const query = `
                INSERT INTO ${this.paymentTable} (amt, customer_id, order_id, currency, payment_date) 
                VALUES (?, ?, ?, ?, ?)
            `;
            
            const [result] = await connection.execute(query, [
                paymentData.amount,
                paymentData.customer_id,
                paymentData.order_id,
                paymentData.currency || 'USD',
                paymentDate
            ]);
            
            return {
                success: true,
                payment_id: result.insertId,
                message: 'Payment recorded successfully'
            };

        } catch (error) {
            console.error('Error recording payment:', error);
            return {
                success: false,
                message: 'Failed to record payment'
            };
        }
    }

    // Get user orders
    async getUserOrders(customerId) {
        try {
            const connection = await database.getConnection();
            const query = `
                SELECT 
                    o.*,
                    p.amt as payment_amount,
                    p.currency,
                    p.payment_date
                FROM ${this.ordersTable} o
                LEFT JOIN ${this.paymentTable} p ON o.order_id = p.order_id
                WHERE o.customer_id = ?
                ORDER BY o.order_date DESC
            `;
            
            const [rows] = await connection.execute(query, [customerId]);
            
            return {
                success: true,
                orders: rows
            };

        } catch (error) {
            console.error('Error getting user orders:', error);
            return {
                success: false,
                message: 'Failed to retrieve orders'
            };
        }
    }

    // Get order details
    async getOrderDetails(orderId) {
        try {
            const connection = await database.getConnection();
            const query = `
                SELECT 
                    od.*,
                    p.product_title,
                    p.product_price,
                    p.product_image
                FROM ${this.orderDetailsTable} od
                INNER JOIN products p ON od.product_id = p.product_id
                WHERE od.order_id = ?
            `;
            
            const [rows] = await connection.execute(query, [orderId]);
            
            return {
                success: true,
                order_details: rows
            };

        } catch (error) {
            console.error('Error getting order details:', error);
            return {
                success: false,
                message: 'Failed to retrieve order details'
            };
        }
    }

    // Get single order with details
    async getOrderById(orderId, customerId) {
        try {
            const connection = await database.getConnection();
            
            // Get order info
            const orderQuery = `
                SELECT 
                    o.*,
                    p.amt as payment_amount,
                    p.currency,
                    p.payment_date
                FROM ${this.ordersTable} o
                LEFT JOIN ${this.paymentTable} p ON o.order_id = p.order_id
                WHERE o.order_id = ? AND o.customer_id = ?
            `;
            const [orderRows] = await connection.execute(orderQuery, [orderId, customerId]);
            
            if (orderRows.length === 0) {
                return {
                    success: false,
                    message: 'Order not found'
                };
            }
            
            // Get order details
            const detailsResult = await this.getOrderDetails(orderId);
            
            return {
                success: true,
                order: orderRows[0],
                order_details: detailsResult.order_details || []
            };

        } catch (error) {
            console.error('Error getting order by ID:', error);
            return {
                success: false,
                message: 'Failed to retrieve order'
            };
        }
    }
}

module.exports = Order;