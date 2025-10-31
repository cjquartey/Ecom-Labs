const database = require('../db/connection');

class Product {
    constructor() {
        this.tableName = 'products';
    }

    // Add new product
    async addProduct(productData) {
        try {
            const connection = await database.getConnection();
            
            const query = `
                INSERT INTO ${this.tableName} 
                (product_cat, product_brand, product_title, product_price, 
                 product_desc, product_image, product_keywords) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                productData.category_id,
                productData.brand_id,
                productData.title,
                productData.price,
                productData.description || null,
                productData.image || null,
                productData.keywords || null
            ];

            const [result] = await connection.execute(query, values);
            
            return {
                success: true,
                product_id: result.insertId,
                message: 'Product added successfully'
            };

        } catch (error) {
            console.error('Error adding product:', error);
            return {
                success: false,
                message: 'Failed to add product. Please try again.'
            };
        }
    }

    // Get all products
    async getAllProducts() {
        try {
            const connection = await database.getConnection();
            const query = `
                SELECT 
                    p.*,
                    c.cat_name,
                    b.brand_name
                FROM ${this.tableName} p
                LEFT JOIN categories c ON p.product_cat = c.cat_id
                LEFT JOIN brands b ON p.product_brand = b.brand_id
                ORDER BY p.product_id DESC
            `;
            const [rows] = await connection.execute(query);
            
            return {
                success: true,
                products: rows
            };

        } catch (error) {
            console.error('Error fetching products:', error);
            return {
                success: false,
                message: 'Failed to fetch products'
            };
        }
    }

    // Get product by ID
    async getProductById(productId) {
        try {
            const connection = await database.getConnection();
            const query = `
                SELECT 
                    p.*,
                    c.cat_name,
                    b.brand_name
                FROM ${this.tableName} p
                LEFT JOIN categories c ON p.product_cat = c.cat_id
                LEFT JOIN brands b ON p.product_brand = b.brand_id
                WHERE p.product_id = ?
            `;
            const [rows] = await connection.execute(query, [productId]);
            
            if (rows.length === 0) {
                return {
                    success: false,
                    message: 'Product not found'
                };
            }
            
            return {
                success: true,
                product: rows[0]
            };

        } catch (error) {
            console.error('Error fetching product by ID:', error);
            return {
                success: false,
                message: 'Failed to fetch product'
            };
        }
    }

    // Update product
    async updateProduct(productId, productData) {
        try {
            const connection = await database.getConnection();
            
            // Build dynamic update query
            const updateFields = [];
            const values = [];
            
            if (productData.category_id !== undefined) {
                updateFields.push('product_cat = ?');
                values.push(productData.category_id);
            }
            if (productData.brand_id !== undefined) {
                updateFields.push('product_brand = ?');
                values.push(productData.brand_id);
            }
            if (productData.title !== undefined) {
                updateFields.push('product_title = ?');
                values.push(productData.title);
            }
            if (productData.price !== undefined) {
                updateFields.push('product_price = ?');
                values.push(productData.price);
            }
            if (productData.description !== undefined) {
                updateFields.push('product_desc = ?');
                values.push(productData.description);
            }
            if (productData.image !== undefined) {
                updateFields.push('product_image = ?');
                values.push(productData.image);
            }
            if (productData.keywords !== undefined) {
                updateFields.push('product_keywords = ?');
                values.push(productData.keywords);
            }
            
            if (updateFields.length === 0) {
                return { success: false, message: 'No fields to update' };
            }
            
            values.push(productId);
            const query = `UPDATE ${this.tableName} SET ${updateFields.join(', ')} WHERE product_id = ?`;
            
            const [result] = await connection.execute(query, values);
            
            return {
                success: result.affectedRows > 0,
                message: result.affectedRows > 0 ? 'Product updated successfully' : 'Product not found'
            };
            
        } catch (error) {
            console.error('Error updating product:', error);
            return {
                success: false,
                message: 'Failed to update product. Please try again.'
            };
        }
    }

    // Delete product
    async deleteProduct(productId) {
        try {
            const connection = await database.getConnection();
            const query = `DELETE FROM ${this.tableName} WHERE product_id = ?`;
            const [result] = await connection.execute(query, [productId]);
            
            return {
                success: result.affectedRows > 0,
                message: result.affectedRows > 0 ? 'Product deleted successfully' : 'Product not found'
            };
            
        } catch (error) {
            console.error('Error deleting product:', error);
            return {
                success: false,
                message: 'Failed to delete product. Please try again.'
            };
        }
    }

    // Get products by category
    async getProductsByCategory(categoryId) {
        try {
            const connection = await database.getConnection();
            const query = `
                SELECT 
                    p.*,
                    c.cat_name,
                    b.brand_name
                FROM ${this.tableName} p
                LEFT JOIN categories c ON p.product_cat = c.cat_id
                LEFT JOIN brands b ON p.product_brand = b.brand_id
                WHERE p.product_cat = ?
                ORDER BY p.product_id DESC
            `;
            const [rows] = await connection.execute(query, [categoryId]);
            
            return {
                success: true,
                products: rows
            };

        } catch (error) {
            console.error('Error fetching products by category:', error);
            return {
                success: false,
                message: 'Failed to fetch products'
            };
        }
    }

    // Get products by brand
    async getProductsByBrand(brandId) {
        try {
            const connection = await database.getConnection();
            const query = `
                SELECT 
                    p.*,
                    c.cat_name,
                    b.brand_name
                FROM ${this.tableName} p
                LEFT JOIN categories c ON p.product_cat = c.cat_id
                LEFT JOIN brands b ON p.product_brand = b.brand_id
                WHERE p.product_brand = ?
                ORDER BY p.product_id DESC
            `;
            const [rows] = await connection.execute(query, [brandId]);
            
            return {
                success: true,
                products: rows
            };

        } catch (error) {
            console.error('Error fetching products by brand:', error);
            return {
                success: false,
                message: 'Failed to fetch products'
            };
        }
    }

    // Get products count
    async getProductsCount() {
        try {
            const connection = await database.getConnection();
            const query = `SELECT COUNT(*) as total FROM ${this.tableName}`;
            const [rows] = await connection.execute(query);
            
            return {
                success: true,
                total: rows[0].total
            };

        } catch (error) {
            console.error('Error getting products count:', error);
            return {
                success: false,
                total: 0
            };
        }
    }
}

module.exports = Product;