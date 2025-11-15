// Product Management JavaScript
class ProductManager {
    
    // Show message to user
    static showMessage(message, type = 'error') {
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        const container = document.querySelector('.container');
        const firstCard = container.querySelector('.stats');
        container.insertBefore(messageDiv, firstCard);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // Load categories and brands for dropdowns
    static async loadCategoriesAndBrands() {
        try {
            // Load categories
            const categoriesResponse = await fetch('/api/categories', {
                method: 'GET',
                credentials: 'include'
            });
            const categoriesResult = await categoriesResponse.json();

            // Load brands
            const brandsResponse = await fetch('/api/brands', {
                method: 'GET',
                credentials: 'include'
            });
            const brandsResult = await brandsResponse.json();

            // Populate category dropdowns
            const categorySelects = ['category', 'edit-category'];
            categorySelects.forEach(selectId => {
                const select = document.getElementById(selectId);
                if (select && categoriesResult.success) {
                    categoriesResult.categories.forEach(cat => {
                        const option = document.createElement('option');
                        option.value = cat.cat_id;
                        option.textContent = cat.cat_name;
                        select.appendChild(option);
                    });
                }
            });

            // Populate brand dropdowns
            const brandSelects = ['brand', 'edit-brand'];
            brandSelects.forEach(selectId => {
                const select = document.getElementById(selectId);
                if (select && brandsResult.success) {
                    brandsResult.brands.forEach(brand => {
                        const option = document.createElement('option');
                        option.value = brand.brand_id;
                        option.textContent = brand.brand_name;
                        select.appendChild(option);
                    });
                }
            });

        } catch (error) {
            console.error('Error loading categories and brands:', error);
            ProductManager.showMessage('Failed to load categories and brands', 'error');
        }
    }

    // Upload image
    static async uploadImage(file) {
        try {
            const formData = new FormData();
            formData.append('product_image', file);

            const response = await fetch('/api/products/upload', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const result = await response.json();
            return result;

        } catch (error) {
            console.error('Error uploading image:', error);
            return {
                success: false,
                message: 'Failed to upload image'
            };
        }
    }

    // Load all products
    static async loadProducts() {
        try {
            const response = await fetch('/api/products', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const result = await response.json();
            
            const container = document.getElementById('products-container');
            const grid = document.getElementById('products-grid');
            
            if (result.success && result.products.length > 0) {
                container.style.display = 'none';
                grid.style.display = 'grid';
                grid.innerHTML = '';
                
                result.products.forEach(product => {
                    ProductManager.addProductCard(product);
                });
                
            } else {
                container.innerHTML = '<div class="no-products">No products found. Add your first product above.</div>';
                grid.style.display = 'none';
            }

        } catch (error) {
            console.error('Error loading products:', error);
            ProductManager.showMessage('Failed to load products', 'error');
            
            const container = document.getElementById('products-container');
            container.innerHTML = '<div class="no-products">Error loading products. Please refresh the page.</div>';
        }
    }

    // Add product card to grid
    static addProductCard(product) {
        const grid = document.getElementById('products-grid');
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-product-id', product.product_id);
        
        const imageUrl = product.product_image || '/images/placeholder.png';
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${product.product_title}" class="product-image" onerror="this.src='/images/placeholder.png'">
            <div class="product-info">
                <div class="product-title">${product.product_title}</div>
                <div class="product-price">$${parseFloat(product.product_price).toFixed(2)}</div>
                <div class="product-meta">Category: ${product.cat_name || 'N/A'}</div>
                <div class="product-meta">Brand: ${product.brand_name || 'N/A'}</div>
                <div class="product-actions">
                    <button class="btn btn-primary btn-sm" onclick="ProductManager.editProduct(${product.product_id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="ProductManager.deleteProduct(${product.product_id})">Delete</button>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    }

    // Add new product
    static async addProduct(productData, imageFile) {
        try {
            // Upload image first if provided
            if (imageFile) {
                const uploadResult = await ProductManager.uploadImage(imageFile);
                if (uploadResult.success) {
                    productData.image = uploadResult.imagePath;
                } else {
                    ProductManager.showMessage(uploadResult.message, 'error');
                    return;
                }
            }

            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(productData)
            });

            const result = await response.json();
            
            if (result.success) {
                ProductManager.showMessage(result.message, 'success');
                
                // Clear form
                document.getElementById('add-product-form').reset();
                document.getElementById('image-preview').classList.remove('show');
                document.getElementById('image-path').value = '';
                
                // Reload products and stats
                await ProductManager.loadProducts();
                await ProductManager.loadStats();
            } else {
                ProductManager.showMessage(result.message, 'error');
            }

        } catch (error) {
            console.error('Error adding product:', error);
            ProductManager.showMessage('Failed to add product. Please try again.', 'error');
        }
    }

    // Edit product
    static async editProduct(productId) {
        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'GET',
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                const product = result.product;
                
                // Populate edit form
                document.getElementById('edit-product-id').value = product.product_id;
                document.getElementById('edit-category').value = product.product_cat;
                document.getElementById('edit-brand').value = product.product_brand;
                document.getElementById('edit-title').value = product.product_title;
                document.getElementById('edit-price').value = product.product_price;
                document.getElementById('edit-description').value = product.product_desc || '';
                document.getElementById('edit-keywords').value = product.product_keywords || '';
                document.getElementById('edit-image-path').value = product.product_image || '';
                
                // Show image preview if exists
                if (product.product_image) {
                    const preview = document.getElementById('edit-image-preview');
                    preview.src = product.product_image;
                    preview.classList.add('show');
                }
                
                // Show modal
                document.getElementById('edit-modal').style.display = 'block';
                
            } else {
                ProductManager.showMessage(result.message, 'error');
            }

        } catch (error) {
            console.error('Error loading product for edit:', error);
            ProductManager.showMessage('Failed to load product details', 'error');
        }
    }

    // Save product changes
    static async saveProduct(productId, productData, imageFile) {
        try {
            // Upload new image if provided
            if (imageFile) {
                const uploadResult = await ProductManager.uploadImage(imageFile);
                if (uploadResult.success) {
                    productData.image = uploadResult.imagePath;
                } else {
                    ProductManager.showMessage(uploadResult.message, 'error');
                    return;
                }
            }

            const response = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(productData)
            });

            const result = await response.json();
            
            if (result.success) {
                ProductManager.showMessage(result.message, 'success');
                ProductManager.closeEditModal();
                await ProductManager.loadProducts();
                await ProductManager.loadStats();
            } else {
                ProductManager.showMessage(result.message, 'error');
            }

        } catch (error) {
            console.error('Error updating product:', error);
            ProductManager.showMessage('Failed to update product. Please try again.', 'error');
        }
    }

    // Close edit modal
    static closeEditModal() {
        document.getElementById('edit-modal').style.display = 'none';
        document.getElementById('edit-product-form').reset();
        document.getElementById('edit-image-preview').classList.remove('show');
    }

    // Delete product
    static async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                ProductManager.showMessage(result.message, 'success');
                
                // Remove card from grid
                const card = document.querySelector(`[data-product-id="${productId}"]`);
                if (card) {
                    card.remove();
                }
                
                // Check if grid is empty
                const grid = document.getElementById('products-grid');
                if (grid.children.length === 0) {
                    const container = document.getElementById('products-container');
                    container.innerHTML = '<div class="no-products">No products found. Add your first product above.</div>';
                    container.style.display = 'block';
                    grid.style.display = 'none';
                }
                
                await ProductManager.loadStats();
            } else {
                ProductManager.showMessage(result.message, 'error');
            }

        } catch (error) {
            console.error('Error deleting product:', error);
            ProductManager.showMessage('Failed to delete product. Please try again.', 'error');
        }
    }

    // Load statistics
    static async loadStats() {
        try {
            const response = await fetch('/api/products/admin/stats', {
                method: 'GET',
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                document.getElementById('total-products').textContent = result.stats.total;
            }

        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }
}

// Initialize form handlers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const addForm = document.getElementById('add-product-form');
    const editForm = document.getElementById('edit-product-form');
    const imageInput = document.getElementById('product-image');
    const imagePreview = document.getElementById('image-preview');
    const editImageInput = document.getElementById('edit-product-image');
    const editImagePreview = document.getElementById('edit-image-preview');
    
    // Image preview for add form
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.classList.add('show');
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Image preview for edit form
    editImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                editImagePreview.src = e.target.result;
                editImagePreview.classList.add('show');
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Add form submission
    addForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            category_id: document.getElementById('category').value,
            brand_id: document.getElementById('brand').value,
            title: document.getElementById('title').value,
            price: document.getElementById('price').value,
            description: document.getElementById('description').value,
            keywords: document.getElementById('keywords').value,
            image: document.getElementById('image-path').value
        };
        
        const imageFile = imageInput.files[0];
        await ProductManager.addProduct(formData, imageFile);
    });
    
    // Edit form submission
    editForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const productId = document.getElementById('edit-product-id').value;
        const formData = {
            category_id: document.getElementById('edit-category').value,
            brand_id: document.getElementById('edit-brand').value,
            title: document.getElementById('edit-title').value,
            price: document.getElementById('edit-price').value,
            description: document.getElementById('edit-description').value,
            keywords: document.getElementById('edit-keywords').value,
            image: document.getElementById('edit-image-path').value
        };
        
        const imageFile = editImageInput.files[0];
        await ProductManager.saveProduct(productId, formData, imageFile);
    });
    
    // Close modal on outside click
    window.onclick = function(event) {
        const modal = document.getElementById('edit-modal');
        if (event.target === modal) {
            ProductManager.closeEditModal();
        }
    };
    
    // Logout handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            await Auth.logout();
        });
    }
});