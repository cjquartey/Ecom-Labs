const express = require('express');
const BrandController = require('../controllers/brandController');
const Core = require('../settings/core');

const router = express.Router();
const brandController = new BrandController();

// Fetch all brands (GET /api/brands)
router.get('/', Core.requireAdmin, async (req, res) => {
    try {
        const result = await brandController.getAllBrands();
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Fetch brands route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Add new brand (POST /api/brands)
router.post('/', Core.requireAdmin, async (req, res) => {
    try {
        const brandData = {
            name: req.body.name
        };

        const result = await brandController.addBrand(brandData);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Add brand route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get specific brand by ID (GET /api/brands/:id)
router.get('/:id', Core.requireAdmin, async (req, res) => {
    try {
        const brandId = req.params.id;
        const result = await brandController.getBrandById(brandId);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }

    } catch (error) {
        console.error('Get brand route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Update brand (PUT /api/brands/:id)
router.put('/:id', Core.requireAdmin, async (req, res) => {
    try {
        const brandId = req.params.id;
        const brandData = {
            name: req.body.name
        };

        const result = await brandController.updateBrand(brandId, brandData);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Update brand route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Delete brand (DELETE /api/brands/:id)
router.delete('/:id', Core.requireAdmin, async (req, res) => {
    try {
        const brandId = req.params.id;
        const result = await brandController.deleteBrand(brandId);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Delete brand route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Check brand name availability (POST /api/brands/check-name)
router.post('/check-name', Core.requireAdmin, async (req, res) => {
    try {
        const { name, excludeId } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Brand name is required'
            });
        }

        const result = await brandController.checkBrandNameAvailability(name, excludeId);
        res.status(200).json(result);

    } catch (error) {
        console.error('Check brand name route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get brand statistics (GET /api/brands/stats)
router.get('/admin/stats', Core.requireAdmin, async (req, res) => {
    try {
        const result = await brandController.getBrandsStats();
        res.status(200).json(result);

    } catch (error) {
        console.error('Brand stats route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;