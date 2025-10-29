const database = require('../db/connection');

class Brand {
    constructor() {
        this.tableName = 'brands';
    }

    // Add new brand
    async addBrand(brandData) {
        try {
            const connection = await database.getConnection();
            
            // Check if brand name already exists
            const existsQuery = `SELECT brand_id FROM ${this.tableName} WHERE brand_name = ?`;
            const [existingRows] = await connection.execute(existsQuery, [brandData.name]);
            
            if (existingRows.length > 0) {
                return {
                    success: false,
                    message: 'Brand name already exists. Please choose a different name.'
                };
            }

            // Insert new brand
            const query = `INSERT INTO ${this.tableName} (brand_name) VALUES (?)`;
            const [result] = await connection.execute(query, [brandData.name]);
            
            return {
                success: true,
                brand_id: result.insertId,
                message: 'Brand created successfully'
            };

        } catch (error) {
            console.error('Error adding brand:', error);
            return {
                success: false,
                message: 'Failed to create brand. Please try again.'
            };
        }
    }

    // Get all brands
    async getAllBrands() {
        try {
            const connection = await database.getConnection();
            const query = `SELECT * FROM ${this.tableName} ORDER BY brand_name ASC`;
            const [rows] = await connection.execute(query);
            
            return {
                success: true,
                brands: rows
            };

        } catch (error) {
            console.error('Error fetching brands:', error);
            return {
                success: false,
                message: 'Failed to fetch brands'
            };
        }
    }

    // Get brand by ID
    async getBrandById(brandId) {
        try {
            const connection = await database.getConnection();
            const query = `SELECT * FROM ${this.tableName} WHERE brand_id = ?`;
            const [rows] = await connection.execute(query, [brandId]);
            
            if (rows.length === 0) {
                return {
                    success: false,
                    message: 'Brand not found'
                };
            }
            
            return {
                success: true,
                brand: rows[0]
            };

        } catch (error) {
            console.error('Error fetching brand by ID:', error);
            return {
                success: false,
                message: 'Failed to fetch brand'
            };
        }
    }

    // Update brand
    async updateBrand(brandId, brandData) {
        try {
            const connection = await database.getConnection();
            
            // Check if new name already exists (but not for the current brand)
            const existsQuery = `SELECT brand_id FROM ${this.tableName} WHERE brand_name = ? AND brand_id != ?`;
            const [existingRows] = await connection.execute(existsQuery, [brandData.name, brandId]);
            
            if (existingRows.length > 0) {
                return {
                    success: false,
                    message: 'Brand name already exists. Please choose a different name.'
                };
            }

            // Update brand
            const query = `UPDATE ${this.tableName} SET brand_name = ? WHERE brand_id = ?`;
            const [result] = await connection.execute(query, [brandData.name, brandId]);
            
            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'Brand not found or no changes made'
                };
            }
            
            return {
                success: true,
                message: 'Brand updated successfully'
            };

        } catch (error) {
            console.error('Error updating brand:', error);
            return {
                success: false,
                message: 'Failed to update brand. Please try again.'
            };
        }
    }

    // Delete brand
    async deleteBrand(brandId) {
        try {
            const connection = await database.getConnection();
            
            // Check if brand exists
            const checkQuery = `SELECT brand_id FROM ${this.tableName} WHERE brand_id = ?`;
            const [existingRows] = await connection.execute(checkQuery, [brandId]);
            
            if (existingRows.length === 0) {
                return {
                    success: false,
                    message: 'Brand not found'
                };
            }

            // Delete brand
            const query = `DELETE FROM ${this.tableName} WHERE brand_id = ?`;
            const [result] = await connection.execute(query, [brandId]);
            
            return {
                success: true,
                message: 'Brand deleted successfully'
            };

        } catch (error) {
            console.error('Error deleting brand:', error);
            
            // Handle foreign key constraint errors
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return {
                    success: false,
                    message: 'Cannot delete brand. It is being used by existing products.'
                };
            }
            
            return {
                success: false,
                message: 'Failed to delete brand. Please try again.'
            };
        }
    }

    // Check if brand name exists
    async brandNameExists(brandName, excludeId = null) {
        try {
            const connection = await database.getConnection();
            let query = `SELECT brand_id FROM ${this.tableName} WHERE brand_name = ?`;
            let params = [brandName];
            
            if (excludeId) {
                query += ' AND brand_id != ?';
                params.push(excludeId);
            }
            
            const [rows] = await connection.execute(query, params);
            return rows.length > 0;

        } catch (error) {
            console.error('Error checking brand name:', error);
            return false;
        }
    }

    // Get brands count
    async getBrandsCount() {
        try {
            const connection = await database.getConnection();
            const query = `SELECT COUNT(*) as total FROM ${this.tableName}`;
            const [rows] = await connection.execute(query);
            
            return {
                success: true,
                total: rows[0].total
            };

        } catch (error) {
            console.error('Error getting brands count:', error);
            return {
                success: false,
                total: 0
            };
        }
    }
}

module.exports = Brand;