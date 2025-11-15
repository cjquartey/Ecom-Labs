const Order = require('../classes/Order');

class OrderController {
    constructor() {
        this.orderModel = new Order();
    }

    // Create order controller
    async createOrder(orderData) {
        try {
            if (!orderData.customer_id) {
                return {
                    success: false,
                    message: 'Customer ID is required'
                };
            }

            const result = await this.orderModel.createOrder(orderData);
            return result;

        } catch (error) {
            console.error('Error in createOrder controller:', error);
            return {
                success: false,
                message: 'Failed to create order'
            };
        }
    }

    // Add order details controller
    async addOrderDetails(orderDetailsData) {
        try {
            if (!orderDetailsData.order_id || !orderDetailsData.product_id || !orderDetailsData.qty) {
                return {
                    success: false,
                    message: 'Order ID, product ID, and quantity are required'
                };
            }

            const result = await this.orderModel.addOrderDetails(orderDetailsData);
            return result;

        } catch (error) {
            console.error('Error in addOrderDetails controller:', error);
            return {
                success: false,
                message: 'Failed to add order details'
            };
        }
    }

    // Record payment controller
    async recordPayment(paymentData) {
        try {
            if (!paymentData.amount || !paymentData.customer_id || !paymentData.order_id) {
                return {
                    success: false,
                    message: 'Amount, customer ID, and order ID are required'
                };
            }

            const result = await this.orderModel.recordPayment(paymentData);
            return result;

        } catch (error) {
            console.error('Error in recordPayment controller:', error);
            return {
                success: false,
                message: 'Failed to record payment'
            };
        }
    }

    // Get user orders controller
    async getUserOrders(customerId) {
        try {
            if (!customerId || isNaN(customerId)) {
                return {
                    success: false,
                    message: 'Valid customer ID is required'
                };
            }

            const result = await this.orderModel.getUserOrders(customerId);
            return result;

        } catch (error) {
            console.error('Error in getUserOrders controller:', error);
            return {
                success: false,
                message: 'Failed to retrieve orders'
            };
        }
    }

    // Get order details controller
    async getOrderDetails(orderId) {
        try {
            if (!orderId || isNaN(orderId)) {
                return {
                    success: false,
                    message: 'Valid order ID is required'
                };
            }

            const result = await this.orderModel.getOrderDetails(orderId);
            return result;

        } catch (error) {
            console.error('Error in getOrderDetails controller:', error);
            return {
                success: false,
                message: 'Failed to retrieve order details'
            };
        }
    }

    // Get order by ID controller
    async getOrderById(orderId, customerId) {
        try {
            if (!orderId || !customerId) {
                return {
                    success: false,
                    message: 'Order ID and customer ID are required'
                };
            }

            const result = await this.orderModel.getOrderById(orderId, customerId);
            return result;

        } catch (error) {
            console.error('Error in getOrderById controller:', error);
            return {
                success: false,
                message: 'Failed to retrieve order'
            };
        }
    }
}

module.exports = OrderController;