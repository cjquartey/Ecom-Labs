const Product = require('../classes/Product');

class ProductController {
    constructor() {
        this.productModel = new Product();
    }

    // Add product controller
    async addProduct(productData) {
        try {
            // Validate required fields
            const requiredFields = ['category_id', 'brand_id', 'title', 'price'];
            const missingFields = requiredFields.filter(field => !productData[field]);
            
            if (missingFields.length > 0) {
                return {
                    success: false,
                    message: `Missing required fields: ${missingFields.join(', ')}`
                };
            }

            // Validate category and brand IDs
            if (isNaN(productData.category_id) || productData.category_id <= 0) {
                return {
                    success: false,
                    message: 'Valid category is required'
                };
            }

            if (isNaN(productData.brand_id) || productData.brand_id <= 0) {
                return {
                    success: false,
                    message: 'Valid brand is required'
                };
            }

            // Validate title
            const title = productData.title.trim();
            if (title.length < 3) {
                return {
                    success: false,
                    message: 'Product title must be at least 3 characters long'
                };
            }

            if (title.length > 200) {
                return {
                    success: false,
                    message: 'Product title must not exceed 200 characters'
                };
            }

            // Validate price
            const price = parseFloat(productData.price);
            if (isNaN(price) || price <= 0) {
                return {
                    success: false,
                    message: 'Valid product price is required (must be greater than 0)'
                };
            }

            // Validate description length if provided
            if (productData.description && productData.description.length > 500) {
                return {
                    success: false,
                    message: 'Product description must not exceed 500 characters'
                };
            }

            // Validate keywords length if provided
            if (productData.keywords && productData.keywords.length > 100) {
                return {
                    success: false,
                    message: 'Product keywords must not exceed 100 characters'
                };
            }

            // Add product through model
            const result = await this.productModel.addProduct({
                category_id: parseInt(productData.category_id),
                brand_id: parseInt(productData.brand_id),
                title: title,
                price: price,
                description: productData.description ? productData.description.trim() : null,
                image: productData.image || null,
                keywords: productData.keywords ? productData.keywords.trim() : null
            });

            return result;

        } catch (error) {
            console.error('Error in addProduct controller:', error);
            return {
                success: false,
                message: 'Failed to add product. Please try again.'
            };
        }
    }

    // Get all products controller
    async getAllProducts() {
        try {
            const result = await this.productModel.getAllProducts();
            return result;
        } catch (error) {
            console.error('Error in getAllProducts controller:', error);
            return {
                success: false,
                message: 'Failed to fetch products'
            };
        }
    }

    // Get product by ID controller
    async getProductById(productId) {
        try {
            if (!productId || isNaN(productId)) {
                return {
                    success: false,
                    message: 'Valid product ID is required'
                };
            }

            const result = await this.productModel.getProductById(productId);
            return result;
        } catch (error) {
            console.error('Error in getProductById controller:', error);
            return {
                success: false,
                message: 'Failed to fetch product'
            };
        }
    }

    // Update product controller
    async updateProduct(productId, productData) {
        try {
            if (!productId || isNaN(productId)) {
                return {
                    success: false,
                    message: 'Valid product ID is required'
                };
            }

            // Validate fields if they are being updated
            const updateData = {};

            if (productData.category_id !== undefined) {
                if (isNaN(productData.category_id) || productData.category_id <= 0) {
                    return {
                        success: false,
                        message: 'Valid category is required'
                    };
                }
                updateData.category_id = parseInt(productData.category_id);
            }

            if (productData.brand_id !== undefined) {
                if (isNaN(productData.brand_id) || productData.brand_id <= 0) {
                    return {
                        success: false,
                        message: 'Valid brand is required'
                    };
                }
                updateData.brand_id = parseInt(productData.brand_id);
            }

            if (productData.title !== undefined) {
                const title = productData.title.trim();
                if (title.length < 3 || title.length > 200) {
                    return {
                        success: false,
                        message: 'Product title must be between 3 and 200 characters'
                    };
                }
                updateData.title = title;
            }

            if (productData.price !== undefined) {
                const price = parseFloat(productData.price);
                if (isNaN(price) || price <= 0) {
                    return {
                        success: false,
                        message: 'Valid product price is required'
                    };
                }
                updateData.price = price;
            }

            if (productData.description !== undefined) {
                if (productData.description && productData.description.length > 500) {
                    return {
                        success: false,
                        message: 'Product description must not exceed 500 characters'
                    };
                }
                updateData.description = productData.description ? productData.description.trim() : null;
            }

            if (productData.keywords !== undefined) {
                if (productData.keywords && productData.keywords.length > 100) {
                    return {
                        success: false,
                        message: 'Product keywords must not exceed 100 characters'
                    };
                }
                updateData.keywords = productData.keywords ? productData.keywords.trim() : null;
            }

            if (productData.image !== undefined) {
                updateData.image = productData.image;
            }

            const result = await this.productModel.updateProduct(productId, updateData);
            return result;

        } catch (error) {
            console.error('Error in updateProduct controller:', error);
            return {
                success: false,
                message: 'Failed to update product. Please try again.'
            };
        }
    }

    // Delete product controller
    async deleteProduct(productId) {
        try {
            if (!productId || isNaN(productId)) {
                return {
                    success: false,
                    message: 'Valid product ID is required'
                };
            }

            const result = await this.productModel.deleteProduct(productId);
            return result;

        } catch (error) {
            console.error('Error in deleteProduct controller:', error);
            return {
                success: false,
                message: 'Failed to delete product. Please try again.'
            };
        }
    }

    // Get products by category
    async getProductsByCategory(categoryId) {
        try {
            if (!categoryId || isNaN(categoryId)) {
                return {
                    success: false,
                    message: 'Valid category ID is required'
                };
            }

            const result = await this.productModel.getProductsByCategory(categoryId);
            return result;
        } catch (error) {
            console.error('Error in getProductsByCategory controller:', error);
            return {
                success: false,
                message: 'Failed to fetch products'
            };
        }
    }

    // Get products by brand
    async getProductsByBrand(brandId) {
        try {
            if (!brandId || isNaN(brandId)) {
                return {
                    success: false,
                    message: 'Valid brand ID is required'
                };
            }

            const result = await this.productModel.getProductsByBrand(brandId);
            return result;
        } catch (error) {
            console.error('Error in getProductsByBrand controller:', error);
            return {
                success: false,
                message: 'Failed to fetch products'
            };
        }
    }

    // Get product statistics
    async getProductStats() {
        try {
            const countResult = await this.productModel.getProductsCount();
            
            return {
                success: true,
                stats: {
                    total: countResult.total || 0
                }
            };

        } catch (error) {
            console.error('Error getting product stats:', error);
            return {
                success: false,
                message: 'Failed to get product statistics'
            };
        }
    }
}

module.exports = ProductController;