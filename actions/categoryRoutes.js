const express = require('express');
const CategoryController = require('../controllers/categoryController');
const Core = require('../settings/core');

const router = express.Router();
const categoryController = new CategoryController();

// Fetch all categories
router.get('/', Core.requireAdmin, async (req, res) => {
    try {
        const result = await categoryController.getAllCategories();
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Fetch categories route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Add new category
router.post('/', Core.requireAdmin, async (req, res) => {
    try {
        const categoryData = {
            name: req.body.name
        };

        const result = await categoryController.addCategory(categoryData);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Add category route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get specific category by ID
router.get('/:id', Core.requireAdmin, async (req, res) => {
    try {
        const categoryId = req.params.id;
        const result = await categoryController.getCategoryById(categoryId);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }

    } catch (error) {
        console.error('Get category route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Update category
router.put('/:id', Core.requireAdmin, async (req, res) => {
    try {
        const categoryId = req.params.id;
        const categoryData = {
            name: req.body.name
        };

        const result = await categoryController.updateCategory(categoryId, categoryData);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Update category route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Delete category
router.delete('/:id', Core.requireAdmin, async (req, res) => {
    try {
        const categoryId = req.params.id;
        const result = await categoryController.deleteCategory(categoryId);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Delete category route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Check category name availability
router.post('/check-name', Core.requireAdmin, async (req, res) => {
    try {
        const { name, excludeId } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        const result = await categoryController.checkCategoryNameAvailability(name, excludeId);
        res.status(200).json(result);

    } catch (error) {
        console.error('Check category name route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get category statistics
router.get('/admin/stats', Core.requireAdmin, async (req, res) => {
    try {
        const result = await categoryController.getCategoriesStats();
        res.status(200).json(result);

    } catch (error) {
        console.error('Category stats route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;