const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ProductController = require('../controllers/productController');
const Core = require('../settings/core');

const router = express.Router();
const productController = new ProductController();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Get user ID from session
        const userId = req.session.user ? req.session.user.id : 'guest';
        
        // Create user-specific directory inside uploads/
        const uploadDir = path.join(__dirname, '..', 'uploads', `u${userId}`);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp-originalname
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// Public routes (no authentication required)

// View all products (GET /api/products/view/all)
router.get('/view/all', async (req, res) => {
    try {
        const result = await productController.viewAllProducts();
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('View all products route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// View single product (GET /api/products/view/:id)
router.get('/view/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const result = await productController.viewSingleProduct(productId);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }

    } catch (error) {
        console.error('View single product route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Search products (GET /api/products/search?q=query)
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }
        
        const result = await productController.searchProducts(query);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Search products route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Filter products by category (GET /api/products/filter/category/:id)
router.get('/filter/category/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;
        const result = await productController.filterProductsByCategory(categoryId);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Filter by category route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Filter products by brand (GET /api/products/filter/brand/:id)
router.get('/filter/brand/:id', async (req, res) => {
    try {
        const brandId = req.params.id;
        const result = await productController.filterProductsByBrand(brandId);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Filter by brand route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Admin routes (authentication required)

// Upload product image (POST /api/products/upload)
router.post('/upload', Core.requireAdmin, upload.single('product_image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file uploaded'
            });
        }
        
        // Return the relative path for database storage
        const userId = req.session.user.id;
        const imagePath = `/uploads/u${userId}/${req.file.filename}`;
        
        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            imagePath: imagePath,
            filename: req.file.filename
        });

    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload image'
        });
    }
});

// Fetch all products (GET /api/products)
router.get('/', async (req, res) => {
    try {
        const result = await productController.getAllProducts();
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Fetch products route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Add new product (POST /api/products)
router.post('/', Core.requireAdmin, async (req, res) => {
    try {
        const productData = {
            category_id: req.body.category_id,
            brand_id: req.body.brand_id,
            title: req.body.title,
            price: req.body.price,
            description: req.body.description,
            image: req.body.image,
            keywords: req.body.keywords
        };

        const result = await productController.addProduct(productData);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Add product route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get specific product by ID (GET /api/products/:id)
router.get('/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const result = await productController.getProductById(productId);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }

    } catch (error) {
        console.error('Get product route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Update product (PUT /api/products/:id)
router.put('/:id', Core.requireAdmin, async (req, res) => {
    try {
        const productId = req.params.id;
        const productData = {
            category_id: req.body.category_id,
            brand_id: req.body.brand_id,
            title: req.body.title,
            price: req.body.price,
            description: req.body.description,
            image: req.body.image,
            keywords: req.body.keywords
        };

        const result = await productController.updateProduct(productId, productData);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Update product route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Delete product (DELETE /api/products/:id)
router.delete('/:id', Core.requireAdmin, async (req, res) => {
    try {
        const productId = req.params.id;
        const result = await productController.deleteProduct(productId);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Delete product route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get products by category (GET /api/products/category/:id)
router.get('/category/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;
        const result = await productController.getProductsByCategory(categoryId);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get products by brand (GET /api/products/brand/:id)
router.get('/brand/:id', async (req, res) => {
    try {
        const brandId = req.params.id;
        const result = await productController.getProductsByBrand(brandId);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Get products by brand error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get product statistics (GET /api/products/admin/stats)
router.get('/admin/stats', Core.requireAdmin, async (req, res) => {
    try {
        const result = await productController.getProductStats();
        res.status(200).json(result);

    } catch (error) {
        console.error('Product stats route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
