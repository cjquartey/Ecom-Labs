// Product Display JavaScript (Customer-Facing)
class ProductDisplay {
    static currentProducts = [];
    static allProducts = [];

    // Load categories and brands for filters
    static async loadFilters() {
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

            // Populate category filter
            const categoryFilter = document.getElementById('category-filter');
            if (categoryFilter && categoriesResult.success) {
                categoriesResult.categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.cat_id;
                    option.textContent = cat.cat_name;
                    categoryFilter.appendChild(option);
                });
            }

            // Populate brand filter
            const brandFilter = document.getElementById('brand-filter');
            if (brandFilter && brandsResult.success) {
                brandsResult.brands.forEach(brand => {
                    const option = document.createElement('option');
                    option.value = brand.brand_id;
                    option.textContent = brand.brand_name;
                    brandFilter.appendChild(option);
                });
            }

            // Add event listeners for filters
            if (categoryFilter) {
                categoryFilter.addEventListener('change', () => {
                    ProductDisplay.applyFilters();
                });
            }

            if (brandFilter) {
                brandFilter.addEventListener('change', () => {
                    ProductDisplay.applyFilters();
                });
            }

        } catch (error) {
            console.error('Error loading filters:', error);
        }
    }

    // Load all products
    static async loadAllProducts() {
        try {
            const response = await fetch('/api/products/view/all', {
                method: 'GET'
            });

            const result = await response.json();
            
            if (result.success && result.products.length > 0) {
                ProductDisplay.allProducts = result.products;
                ProductDisplay.currentProducts = result.products;
                ProductDisplay.displayProducts(result.products);
            } else {
                ProductDisplay.showNoProducts('No products available at the moment.');
            }

        } catch (error) {
            console.error('Error loading products:', error);
            ProductDisplay.showError('Failed to load products. Please try again.');
        }
    }

    // Search products
    static async searchProducts(query) {
        try {
            const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`, {
                method: 'GET'
            });

            const result = await response.json();
            
            if (result.success && result.products.length > 0) {
                ProductDisplay.allProducts = result.products;
                ProductDisplay.currentProducts = result.products;
                ProductDisplay.displayProducts(result.products);
            } else {
                ProductDisplay.showNoProducts(`No products found for "${query}".`);
            }

        } catch (error) {
            console.error('Error searching products:', error);
            ProductDisplay.showError('Search failed. Please try again.');
        }
    }

    // Apply filters
    static applyFilters() {
        const categoryFilter = document.getElementById('category-filter');
        const brandFilter = document.getElementById('brand-filter');

        const categoryId = categoryFilter ? categoryFilter.value : '';
        const brandId = brandFilter ? brandFilter.value : '';

        let filteredProducts = [...ProductDisplay.allProducts];

        if (categoryId) {
            filteredProducts = filteredProducts.filter(p => p.product_cat == categoryId);
        }

        if (brandId) {
            filteredProducts = filteredProducts.filter(p => p.product_brand == brandId);
        }

        ProductDisplay.currentProducts = filteredProducts;
        
        if (filteredProducts.length > 0) {
            ProductDisplay.displayProducts(filteredProducts);
        } else {
            ProductDisplay.showNoProducts('No products match your filter criteria.');
        }
    }

    // Clear filters
    static clearFilters() {
        const categoryFilter = document.getElementById('category-filter');
        const brandFilter = document.getElementById('brand-filter');

        if (categoryFilter) categoryFilter.value = '';
        if (brandFilter) brandFilter.value = '';

        ProductDisplay.currentProducts = ProductDisplay.allProducts;
        ProductDisplay.displayProducts(ProductDisplay.allProducts);
    }

    // Clear search filters (for search results page)
    static clearSearchFilters() {
        ProductDisplay.clearFilters();
    }

    // Display products in grid
    static displayProducts(products) {
        const container = document.getElementById('products-container');
        const grid = document.getElementById('products-grid');
        const resultsCount = document.getElementById('results-count');

        container.style.display = 'none';
        grid.style.display = 'grid';
        grid.innerHTML = '';

        products.forEach(product => {
            const card = ProductDisplay.createProductCard(product);
            grid.appendChild(card);
        });

        if (resultsCount) {
            resultsCount.textContent = `Showing ${products.length} product${products.length !== 1 ? 's' : ''}`;
        }
    }

    // Create product card
    static createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => {
            window.location.href = `single_product.html?id=${product.product_id}`;
        };

        const imageUrl = product.product_image || '/images/placeholder.png';

        card.innerHTML = `
            <img src="${imageUrl}" alt="${product.product_title}" class="product-image" onerror="this.src='/images/placeholder.png'">
            <div class="product-info">
                <div class="product-title">${product.product_title}</div>
                <div class="product-price">${parseFloat(product.product_price).toFixed(2)}</div>
                <div class="product-meta">Category: ${product.cat_name || 'N/A'}</div>
                <div class="product-meta">Brand: ${product.brand_name || 'N/A'}</div>
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="event.stopPropagation(); ProductDisplay.addToCart(${product.product_id});">Add to Cart</button>
                </div>
            </div>
        `;

        return card;
    }

    // Add to cart function
    static async addToCart(productId) {
        // Check if user is logged in
        const authStatus = await Auth.checkSessionStatus();
        
        if (!authStatus.isLoggedIn) {
            alert('Please login to add products to your cart');
            window.location.href = '/login/login.html';
            return;
        }

        // Add to cart
        await CartManager.addToCart(productId, 1);
    }

    // Load single product
    static async loadSingleProduct(productId) {
        try {
            const response = await fetch(`/api/products/view/${productId}`, {
                method: 'GET'
            });

            const result = await response.json();
            
            if (result.success) {
                ProductDisplay.displaySingleProduct(result.product);
            } else {
                ProductDisplay.showError(result.message || 'Product not found');
            }

        } catch (error) {
            console.error('Error loading product:', error);
            ProductDisplay.showError('Failed to load product details.');
        }
    }

    // Display single product
    static displaySingleProduct(product) {
        const container = document.getElementById('product-container');
        const detail = document.getElementById('product-detail');

        container.style.display = 'none';
        detail.style.display = 'block';

        const imageUrl = product.product_image || '/images/placeholder.png';
        const keywords = product.product_keywords ? product.product_keywords.split(',') : [];

        detail.innerHTML = `
            <div class="product-layout">
                <div class="product-image-section">
                    <img src="${imageUrl}" alt="${product.product_title}" class="product-image-large" onerror="this.src='/images/placeholder.png'">
                </div>
                <div class="product-info-section">
                    <h1 class="product-title">${product.product_title}</h1>
                    <div class="product-price">$${parseFloat(product.product_price).toFixed(2)}</div>
                    
                    <div class="product-meta">
                        <div class="meta-item">
                            <span class="meta-label">Product ID</span>
                            <span class="meta-value">#${product.product_id}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Category</span>
                            <span class="meta-value">${product.cat_name || 'N/A'}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Brand</span>
                            <span class="meta-value">${product.brand_name || 'N/A'}</span>
                        </div>
                    </div>

                    ${product.product_desc ? `
                        <div class="product-description">
                            <h3>Description</h3>
                            <p>${product.product_desc}</p>
                        </div>
                    ` : ''}

                    ${keywords.length > 0 ? `
                        <div class="product-keywords">
                            <h3>Keywords</h3>
                            <div class="keywords-list">
                                ${keywords.map(k => `<span class="keyword-tag">${k.trim()}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div class="product-actions">
                        <button class="btn btn-success" onclick="alert('Add to cart feature coming soon!');">Add to Cart</button>
                        <a href="all_products.html" class="btn btn-primary">Back to Products</a>
                    </div>
                </div>
            </div>
        `;
    }

    // Show no products message
    static showNoProducts(message) {
        const container = document.getElementById('products-container');
        const grid = document.getElementById('products-grid');
        const resultsCount = document.getElementById('results-count');

        grid.style.display = 'none';
        container.style.display = 'block';
        container.innerHTML = `<div class="no-products"><h2>${message}</h2><p>Try adjusting your filters or search query.</p></div>`;

        if (resultsCount) {
            resultsCount.textContent = 'No products found';
        }
    }

    // Show error message
    static showError(message) {
        const container = document.getElementById('product-container');
        if (container) {
            container.innerHTML = `<div class="error"><h2>Error</h2><p>${message}</p></div>`;
        }
    }
}