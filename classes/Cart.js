const database = require('../db/connection');

class Cart {
    constructor() {
        this.tableName = 'cart';
    }

    // Add product to cart
    async addToCart(cartData) {
        try {
            const connection = await database.getConnection();
            
            // Check if product already exists in cart for this customer
            const checkQuery = `
                SELECT * FROM ${this.tableName} 
                WHERE p_id = ? AND c_id = ?
            `;
            const [existing] = await connection.execute(checkQuery, [cartData.product_id, cartData.customer_id]);
            
            if (existing.length > 0) {
                // Product exists, update quantity
                const newQty = existing[0].qty + (cartData.qty || 1);
                const updateQuery = `UPDATE ${this.tableName} SET qty = ? WHERE p_id = ? AND c_id = ?`;
                await connection.execute(updateQuery, [newQty, cartData.product_id, cartData.customer_id]);
                
                return {
                    success: true,
                    message: 'Cart updated successfully',
                    updated: true
                };
            } else {
                // Product doesn't exist, insert new
                const insertQuery = `
                    INSERT INTO ${this.tableName} (p_id, ip_add, c_id, qty) 
                    VALUES (?, ?, ?, ?)
                `;
                await connection.execute(insertQuery, [
                    cartData.product_id,
                    cartData.ip_address || '0.0.0.0',
                    cartData.customer_id,
                    cartData.qty || 1
                ]);
                
                return {
                    success: true,
                    message: 'Product added to cart successfully',
                    updated: false
                };
            }

        } catch (error) {
            console.error('Error adding to cart:', error);
            return {
                success: false,
                message: 'Failed to add product to cart'
            };
        }
    }

    // Get all cart items for a customer
    async getUserCart(customerId) {
        try {
            const connection = await database.getConnection();
            const query = `
                SELECT 
                    c.*,
                    p.product_title,
                    p.product_price,
                    p.product_image,
                    p.product_desc,
                    cat.cat_name,
                    b.brand_name
                FROM ${this.tableName} c
                INNER JOIN products p ON c.p_id = p.product_id
                LEFT JOIN categories cat ON p.product_cat = cat.cat_id
                LEFT JOIN brands b ON p.product_brand = b.brand_id
                WHERE c.c_id = ?
            `;
            const [rows] = await connection.execute(query, [customerId]);
            
            return {
                success: true,
                cart_items: rows
            };

        } catch (error) {
            console.error('Error getting user cart:', error);
            return {
                success: false,
                message: 'Failed to retrieve cart items'
            };
        }
    }

    // Update cart item quantity
    async updateCartQuantity(productId, customerId, qty) {
        try {
            const connection = await database.getConnection();
            
            if (qty <= 0) {
                // If quantity is 0 or less, remove the item
                return await this.removeFromCart(productId, customerId);
            }
            
            const query = `UPDATE ${this.tableName} SET qty = ? WHERE p_id = ? AND c_id = ?`;
            const [result] = await connection.execute(query, [qty, productId, customerId]);
            
            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'Cart item not found'
                };
            }
            
            return {
                success: true,
                message: 'Cart quantity updated successfully'
            };

        } catch (error) {
            console.error('Error updating cart quantity:', error);
            return {
                success: false,
                message: 'Failed to update cart quantity'
            };
        }
    }

    // Remove product from cart
    async removeFromCart(productId, customerId) {
        try {
            const connection = await database.getConnection();
            const query = `DELETE FROM ${this.tableName} WHERE p_id = ? AND c_id = ?`;
            const [result] = await connection.execute(query, [productId, customerId]);
            
            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'Cart item not found'
                };
            }
            
            return {
                success: true,
                message: 'Product removed from cart successfully'
            };

        } catch (error) {
            console.error('Error removing from cart:', error);
            return {
                success: false,
                message: 'Failed to remove product from cart'
            };
        }
    }

    // Empty entire cart for a customer
    async emptyCart(customerId) {
        try {
            const connection = await database.getConnection();
            const query = `DELETE FROM ${this.tableName} WHERE c_id = ?`;
            await connection.execute(query, [customerId]);
            
            return {
                success: true,
                message: 'Cart emptied successfully'
            };

        } catch (error) {
            console.error('Error emptying cart:', error);
            return {
                success: false,
                message: 'Failed to empty cart'
            };
        }
    }

    // Get cart count for a customer
    async getCartCount(customerId) {
        try {
            const connection = await database.getConnection();
            const query = `SELECT SUM(qty) as count FROM ${this.tableName} WHERE c_id = ?`;
            const [rows] = await connection.execute(query, [customerId]);
            
            return {
                success: true,
                count: rows[0].count || 0
            };

        } catch (error) {
            console.error('Error getting cart count:', error);
            return {
                success: false,
                count: 0
            };
        }
    }

    // Check if product exists in cart
    async productExistsInCart(productId, customerId) {
        try {
            const connection = await database.getConnection();
            const query = `SELECT * FROM ${this.tableName} WHERE p_id = ? AND c_id = ?`;
            const [rows] = await connection.execute(query, [productId, customerId]);
            
            return rows.length > 0;

        } catch (error) {
            console.error('Error checking if product exists in cart:', error);
            return false;
        }
    }
}

module.exports = Cart;