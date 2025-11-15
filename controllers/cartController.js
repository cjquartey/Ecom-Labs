const Cart = require('../classes/Cart');

class CartController {
    constructor() {
        this.cartModel = new Cart();
    }

    // Add to cart controller
    async addToCart(cartData) {
        try {
            // Validate required fields
            if (!cartData.product_id || !cartData.customer_id) {
                return {
                    success: false,
                    message: 'Product ID and customer ID are required'
                };
            }

            // Validate product ID
            if (isNaN(cartData.product_id) || cartData.product_id <= 0) {
                return {
                    success: false,
                    message: 'Valid product ID is required'
                };
            }

            // Validate quantity
            const qty = parseInt(cartData.qty) || 1;
            if (qty <= 0) {
                return {
                    success: false,
                    message: 'Quantity must be greater than 0'
                };
            }

            cartData.qty = qty;

            const result = await this.cartModel.addToCart(cartData);
            return result;

        } catch (error) {
            console.error('Error in addToCart controller:', error);
            return {
                success: false,
                message: 'Failed to add product to cart'
            };
        }
    }

    // Get user cart controller
    async getUserCart(customerId) {
        try {
            if (!customerId || isNaN(customerId)) {
                return {
                    success: false,
                    message: 'Valid customer ID is required'
                };
            }

            const result = await this.cartModel.getUserCart(customerId);
            return result;

        } catch (error) {
            console.error('Error in getUserCart controller:', error);
            return {
                success: false,
                message: 'Failed to retrieve cart'
            };
        }
    }

    // Update cart quantity controller
    async updateCartQuantity(productId, customerId, qty) {
        try {
            if (!productId || !customerId) {
                return {
                    success: false,
                    message: 'Product ID and customer ID are required'
                };
            }

            const quantity = parseInt(qty);
            if (isNaN(quantity) || quantity < 0) {
                return {
                    success: false,
                    message: 'Valid quantity is required'
                };
            }

            const result = await this.cartModel.updateCartQuantity(productId, customerId, quantity);
            return result;

        } catch (error) {
            console.error('Error in updateCartQuantity controller:', error);
            return {
                success: false,
                message: 'Failed to update cart quantity'
            };
        }
    }

    // Remove from cart controller
    async removeFromCart(productId, customerId) {
        try {
            if (!productId || !customerId) {
                return {
                    success: false,
                    message: 'Product ID and customer ID are required'
                };
            }

            const result = await this.cartModel.removeFromCart(productId, customerId);
            return result;

        } catch (error) {
            console.error('Error in removeFromCart controller:', error);
            return {
                success: false,
                message: 'Failed to remove product from cart'
            };
        }
    }

    // Empty cart controller
    async emptyCart(customerId) {
        try {
            if (!customerId || isNaN(customerId)) {
                return {
                    success: false,
                    message: 'Valid customer ID is required'
                };
            }

            const result = await this.cartModel.emptyCart(customerId);
            return result;

        } catch (error) {
            console.error('Error in emptyCart controller:', error);
            return {
                success: false,
                message: 'Failed to empty cart'
            };
        }
    }

    // Get cart count controller
    async getCartCount(customerId) {
        try {
            if (!customerId || isNaN(customerId)) {
                return {
                    success: false,
                    count: 0
                };
            }

            const result = await this.cartModel.getCartCount(customerId);
            return result;

        } catch (error) {
            console.error('Error in getCartCount controller:', error);
            return {
                success: false,
                count: 0
            };
        }
    }
}

module.exports = CartController;