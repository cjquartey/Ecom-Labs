const Brand = require('../classes/Brand');

class BrandController {
    constructor() {
        this.brandModel = new Brand();
    }

    // Add brand controller
    async addBrand(brandData) {
        try {
            // Validate required fields
            if (!brandData.name) {
                return {
                    success: false,
                    message: 'Brand name is required'
                };
            }

            // Validate brand name length and format
            const brandName = brandData.name.trim();
            
            if (brandName.length < 2) {
                return {
                    success: false,
                    message: 'Brand name must be at least 2 characters long'
                };
            }

            if (brandName.length > 100) {
                return {
                    success: false,
                    message: 'Brand name must not exceed 100 characters'
                };
            }

            // Basic validation for brand name (letters, numbers, spaces, hyphens)
            const nameRegex = /^[a-zA-Z0-9\s\-&]+$/;
            if (!nameRegex.test(brandName)) {
                return {
                    success: false,
                    message: 'Brand name can only contain letters, numbers, spaces, hyphens, and ampersands'
                };
            }

            // Add brand through model
            const result = await this.brandModel.addBrand({
                name: brandName
            });

            return result;

        } catch (error) {
            console.error('Error in addBrand controller:', error);
            return {
                success: false,
                message: 'Failed to create brand. Please try again.'
            };
        }
    }

    // Get all brands controller
    async getAllBrands() {
        try {
            const result = await this.brandModel.getAllBrands();
            return result;
        } catch (error) {
            console.error('Error in getAllBrands controller:', error);
            return {
                success: false,
                message: 'Failed to fetch brands'
            };
        }
    }

    // Get brand by ID controller
    async getBrandById(brandId) {
        try {
            // Validate brand ID
            if (!brandId || isNaN(brandId)) {
                return {
                    success: false,
                    message: 'Valid brand ID is required'
                };
            }

            const result = await this.brandModel.getBrandById(brandId);
            return result;
        } catch (error) {
            console.error('Error in getBrandById controller:', error);
            return {
                success: false,
                message: 'Failed to fetch brand'
            };
        }
    }

    // Update brand controller
    async updateBrand(brandId, brandData) {
        try {
            // Validate brand ID
            if (!brandId || isNaN(brandId)) {
                return {
                    success: false,
                    message: 'Valid brand ID is required'
                };
            }

            // Validate required fields
            if (!brandData.name) {
                return {
                    success: false,
                    message: 'Brand name is required'
                };
            }

            // Validate brand name
            const brandName = brandData.name.trim();
            
            if (brandName.length < 2) {
                return {
                    success: false,
                    message: 'Brand name must be at least 2 characters long'
                };
            }

            if (brandName.length > 100) {
                return {
                    success: false,
                    message: 'Brand name must not exceed 100 characters'
                };
            }

            const nameRegex = /^[a-zA-Z0-9\s\-&]+$/;
            if (!nameRegex.test(brandName)) {
                return {
                    success: false,
                    message: 'Brand name can only contain letters, numbers, spaces, hyphens, and ampersands'
                };
            }

            // Update brand through model
            const result = await this.brandModel.updateBrand(brandId, {
                name: brandName
            });

            return result;

        } catch (error) {
            console.error('Error in updateBrand controller:', error);
            return {
                success: false,
                message: 'Failed to update brand. Please try again.'
            };
        }
    }

    // Delete brand controller
    async deleteBrand(brandId) {
        try {
            // Validate brand ID
            if (!brandId || isNaN(brandId)) {
                return {
                    success: false,
                    message: 'Valid brand ID is required'
                };
            }

            const result = await this.brandModel.deleteBrand(brandId);
            return result;

        } catch (error) {
            console.error('Error in deleteBrand controller:', error);
            return {
                success: false,
                message: 'Failed to delete brand. Please try again.'
            };
        }
    }

    // Check if brand name is available
    async checkBrandNameAvailability(brandName, excludeId = null) {
        try {
            if (!brandName) {
                return {
                    success: false,
                    message: 'Brand name is required'
                };
            }

            const exists = await this.brandModel.brandNameExists(brandName.trim(), excludeId);
            
            return {
                success: true,
                available: !exists,
                message: exists ? 'Brand name is already taken' : 'Brand name is available'
            };

        } catch (error) {
            console.error('Error checking brand name availability:', error);
            return {
                success: false,
                message: 'Could not check brand name availability'
            };
        }
    }

    // Get brands statistics
    async getBrandsStats() {
        try {
            const countResult = await this.brandModel.getBrandsCount();
            
            return {
                success: true,
                stats: {
                    total: countResult.total || 0
                }
            };

        } catch (error) {
            console.error('Error getting brands stats:', error);
            return {
                success: false,
                message: 'Failed to get brand statistics'
            };
        }
    }
}

module.exports = BrandController;
