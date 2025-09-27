const Category = require('../classes/Category');

class CategoryController {
    constructor() {
        this.categoryModel = new Category();
    }

    // Add category controller
    async addCategory(categoryData) {
        try {
            // Validate required fields
            if (!categoryData.name) {
                return {
                    success: false,
                    message: 'Category name is required'
                };
            }

            // Validate category name length and format
            const categoryName = categoryData.name.trim();
            
            if (categoryName.length < 2) {
                return {
                    success: false,
                    message: 'Category name must be at least 2 characters long'
                };
            }

            if (categoryName.length > 100) {
                return {
                    success: false,
                    message: 'Category name must not exceed 100 characters'
                };
            }

            // Basic validation for category name (letters, numbers, spaces, hyphens)
            const nameRegex = /^[a-zA-Z0-9\s\-&]+$/;
            if (!nameRegex.test(categoryName)) {
                return {
                    success: false,
                    message: 'Category name can only contain letters, numbers, spaces, hyphens, and ampersands'
                };
            }

            // Add category through model
            const result = await this.categoryModel.addCategory({
                name: categoryName
            });

            return result;

        } catch (error) {
            console.error('Error in addCategory controller:', error);
            return {
                success: false,
                message: 'Failed to create category. Please try again.'
            };
        }
    }

    // Get all categories controller
    async getAllCategories() {
        try {
            const result = await this.categoryModel.getAllCategories();
            return result;
        } catch (error) {
            console.error('Error in getAllCategories controller:', error);
            return {
                success: false,
                message: 'Failed to fetch categories'
            };
        }
    }

    // Get category by ID controller
    async getCategoryById(categoryId) {
        try {
            // Validate category ID
            if (!categoryId || isNaN(categoryId)) {
                return {
                    success: false,
                    message: 'Valid category ID is required'
                };
            }

            const result = await this.categoryModel.getCategoryById(categoryId);
            return result;
        } catch (error) {
            console.error('Error in getCategoryById controller:', error);
            return {
                success: false,
                message: 'Failed to fetch category'
            };
        }
    }

    // Update category controller
    async updateCategory(categoryId, categoryData) {
        try {
            // Validate category ID
            if (!categoryId || isNaN(categoryId)) {
                return {
                    success: false,
                    message: 'Valid category ID is required'
                };
            }

            // Validate required fields
            if (!categoryData.name) {
                return {
                    success: false,
                    message: 'Category name is required'
                };
            }

            // Validate category name
            const categoryName = categoryData.name.trim();
            
            if (categoryName.length < 2) {
                return {
                    success: false,
                    message: 'Category name must be at least 2 characters long'
                };
            }

            if (categoryName.length > 100) {
                return {
                    success: false,
                    message: 'Category name must not exceed 100 characters'
                };
            }

            const nameRegex = /^[a-zA-Z0-9\s\-&]+$/;
            if (!nameRegex.test(categoryName)) {
                return {
                    success: false,
                    message: 'Category name can only contain letters, numbers, spaces, hyphens, and ampersands'
                };
            }

            // Update category through model
            const result = await this.categoryModel.updateCategory(categoryId, {
                name: categoryName
            });

            return result;

        } catch (error) {
            console.error('Error in updateCategory controller:', error);
            return {
                success: false,
                message: 'Failed to update category. Please try again.'
            };
        }
    }

    // Delete category controller
    async deleteCategory(categoryId) {
        try {
            // Validate category ID
            if (!categoryId || isNaN(categoryId)) {
                return {
                    success: false,
                    message: 'Valid category ID is required'
                };
            }

            const result = await this.categoryModel.deleteCategory(categoryId);
            return result;

        } catch (error) {
            console.error('Error in deleteCategory controller:', error);
            return {
                success: false,
                message: 'Failed to delete category. Please try again.'
            };
        }
    }

    // Check if category name is available
    async checkCategoryNameAvailability(categoryName, excludeId = null) {
        try {
            if (!categoryName) {
                return {
                    success: false,
                    message: 'Category name is required'
                };
            }

            const exists = await this.categoryModel.categoryNameExists(categoryName.trim(), excludeId);
            
            return {
                success: true,
                available: !exists,
                message: exists ? 'Category name is already taken' : 'Category name is available'
            };

        } catch (error) {
            console.error('Error checking category name availability:', error);
            return {
                success: false,
                message: 'Could not check category name availability'
            };
        }
    }

    // Get categories statistics
    async getCategoriesStats() {
        try {
            const countResult = await this.categoryModel.getCategoriesCount();
            
            return {
                success: true,
                stats: {
                    total: countResult.total || 0
                }
            };

        } catch (error) {
            console.error('Error getting categories stats:', error);
            return {
                success: false,
                message: 'Failed to get category statistics'
            };
        }
    }
}

module.exports = CategoryController;