const database = require('../db/connection');

class Category {
    constructor() {
        this.tableName = 'categories';
    }

    // Add new category
    async addCategory(categoryData) {
        try {
            const connection = await database.getConnection();
            
            // Check if category name already exists
            const existsQuery = `SELECT cat_id FROM ${this.tableName} WHERE cat_name = ?`;
            const [existingRows] = await connection.execute(existsQuery, [categoryData.name]);
            
            if (existingRows.length > 0) {
                return {
                    success: false,
                    message: 'Category name already exists. Please choose a different name.'
                };
            }

            // Insert new category
            const query = `INSERT INTO ${this.tableName} (cat_name) VALUES (?)`;
            const [result] = await connection.execute(query, [categoryData.name]);
            
            return {
                success: true,
                category_id: result.insertId,
                message: 'Category created successfully'
            };

        } catch (error) {
            console.error('Error adding category:', error);
            return {
                success: false,
                message: 'Failed to create category. Please try again.'
            };
        }
    }

    // Get all categories
    async getAllCategories() {
        try {
            const connection = await database.getConnection();
            const query = `SELECT * FROM ${this.tableName} ORDER BY cat_name ASC`;
            const [rows] = await connection.execute(query);
            
            return {
                success: true,
                categories: rows
            };

        } catch (error) {
            console.error('Error fetching categories:', error);
            return {
                success: false,
                message: 'Failed to fetch categories'
            };
        }
    }

    // Get category by ID
    async getCategoryById(categoryId) {
        try {
            const connection = await database.getConnection();
            const query = `SELECT * FROM ${this.tableName} WHERE cat_id = ?`;
            const [rows] = await connection.execute(query, [categoryId]);
            
            if (rows.length === 0) {
                return {
                    success: false,
                    message: 'Category not found'
                };
            }
            
            return {
                success: true,
                category: rows[0]
            };

        } catch (error) {
            console.error('Error fetching category by ID:', error);
            return {
                success: false,
                message: 'Failed to fetch category'
            };
        }
    }

    // Update category
    async updateCategory(categoryId, categoryData) {
        try {
            const connection = await database.getConnection();
            
            // Check if new name already exists (but not for the current category)
            const existsQuery = `SELECT cat_id FROM ${this.tableName} WHERE cat_name = ? AND cat_id != ?`;
            const [existingRows] = await connection.execute(existsQuery, [categoryData.name, categoryId]);
            
            if (existingRows.length > 0) {
                return {
                    success: false,
                    message: 'Category name already exists. Please choose a different name.'
                };
            }

            // Update category
            const query = `UPDATE ${this.tableName} SET cat_name = ? WHERE cat_id = ?`;
            const [result] = await connection.execute(query, [categoryData.name, categoryId]);
            
            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'Category not found or no changes made'
                };
            }
            
            return {
                success: true,
                message: 'Category updated successfully'
            };

        } catch (error) {
            console.error('Error updating category:', error);
            return {
                success: false,
                message: 'Failed to update category. Please try again.'
            };
        }
    }

    // Delete category
    async deleteCategory(categoryId) {
        try {
            const connection = await database.getConnection();
            
            // Check if category exists
            const checkQuery = `SELECT cat_id FROM ${this.tableName} WHERE cat_id = ?`;
            const [existingRows] = await connection.execute(checkQuery, [categoryId]);
            
            if (existingRows.length === 0) {
                return {
                    success: false,
                    message: 'Category not found'
                };
            }

            // Delete category
            const query = `DELETE FROM ${this.tableName} WHERE cat_id = ?`;
            const [result] = await connection.execute(query, [categoryId]);
            
            return {
                success: true,
                message: 'Category deleted successfully'
            };

        } catch (error) {
            console.error('Error deleting category:', error);
            
            // Handle foreign key constraint errors
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return {
                    success: false,
                    message: 'Cannot delete category. It is being used by existing products.'
                };
            }
            
            return {
                success: false,
                message: 'Failed to delete category. Please try again.'
            };
        }
    }

    // Check if category name exists
    async categoryNameExists(categoryName, excludeId = null) {
        try {
            const connection = await database.getConnection();
            let query = `SELECT cat_id FROM ${this.tableName} WHERE cat_name = ?`;
            let params = [categoryName];
            
            if (excludeId) {
                query += ' AND cat_id != ?';
                params.push(excludeId);
            }
            
            const [rows] = await connection.execute(query, params);
            return rows.length > 0;

        } catch (error) {
            console.error('Error checking category name:', error);
            return false;
        }
    }

    // Get categories count
    async getCategoriesCount() {
        try {
            const connection = await database.getConnection();
            const query = `SELECT COUNT(*) as total FROM ${this.tableName}`;
            const [rows] = await connection.execute(query);
            
            return {
                success: true,
                total: rows[0].total
            };

        } catch (error) {
            console.error('Error getting categories count:', error);
            return {
                success: false,
                total: 0
            };
        }
    }
}

module.exports = Category;