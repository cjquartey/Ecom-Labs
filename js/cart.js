// Cart Management JavaScript
class CartManager {
    static cartItems = [];

    // Load cart
    static async loadCart() {
        try {
            const response = await fetch('/api/cart', {
                method: 'GET',
                credentials: 'include'
            });

            const result = await response.json();
            
            document.getElementById('loading-container').style.display = 'none';

            if (result.success && result.cart_items.length > 0) {
                CartManager.cartItems = result.cart_items;
                CartManager.displayCart(result.cart_items);
            } else {
                CartManager.showEmptyCart();
            }

        } catch (error) {
            console.error('Error loading cart:', error);
            alert('Failed to load cart. Please try again.');
        }
    }

    // Display cart items
    static displayCart(items) {
        const container = document.getElementById('cart-container');
        const itemsContainer = document.getElementById('cart-items');
        
        container.style.display = 'block';
        itemsContainer.innerHTML = '';

        let subtotal = 0;

        items.forEach(item => {
            const itemSubtotal = parseFloat(item.product_price) * parseInt(item.qty);
            subtotal += itemSubtotal;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <img src="${item.product_image || '/images/placeholder.png'}" 
                     alt="${item.product_title}" 
                     class="item-image"
                     onerror="this.src='/images/placeholder.png'">
                <div class="item-info">
                    <h4>${item.product_title}</h4>
                    <p>${item.cat_name} - ${item.brand_name}</p>
                </div>
                <div class="item-price">$${parseFloat(item.product_price).toFixed(2)}</div>
                <div class="item-quantity">
                    <button class="qty-btn" onclick="CartManager.updateQuantity(${item.p_id}, ${item.qty - 1})">-</button>
                    <input type="number" class="qty-input" value="${item.qty}" min="1" 
                           onchange="CartManager.updateQuantity(${item.p_id}, this.value)">
                    <button class="qty-btn" onclick="CartManager.updateQuantity(${item.p_id}, ${item.qty + 1})">+</button>
                </div>
                <div class="item-subtotal">$${itemSubtotal.toFixed(2)}</div>
                <button class="remove-btn" onclick="CartManager.removeItem(${item.p_id})" title="Remove item">×</button>
            `;
            itemsContainer.appendChild(itemDiv);
        });

        // Update summary
        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('total').textContent = `$${subtotal.toFixed(2)}`;
    }

    // Show empty cart
    static showEmptyCart() {
        document.getElementById('empty-cart-container').style.display = 'block';
    }

    // Add to cart (from product pages)
    static async addToCart(productId, qty = 1) {
        try {
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    product_id: productId,
                    qty: qty
                })
            });

            const result = await response.json();
            
            if (result.success) {
                alert(result.message);
                // Update cart count if on a product page
                CartManager.updateCartCount();
            } else {
                alert(result.message);
            }

        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add product to cart. Please try again.');
        }
    }

    // Update quantity
    static async updateQuantity(productId, newQty) {
        try {
            const qty = parseInt(newQty);
            
            if (qty < 0) return;

            const response = await fetch('/api/cart/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    product_id: productId,
                    qty: qty
                })
            });

            const result = await response.json();
            
            if (result.success) {
                // Reload cart
                await CartManager.loadCart();
            } else {
                alert(result.message);
            }

        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Failed to update quantity. Please try again.');
        }
    }

    // Remove item
    static async removeItem(productId) {
        if (!confirm('Are you sure you want to remove this item from your cart?')) {
            return;
        }

        try {
            const response = await fetch('/api/cart/remove', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    product_id: productId
                })
            });

            const result = await response.json();
            
            if (result.success) {
                // Reload cart
                await CartManager.loadCart();
            } else {
                alert(result.message);
            }

        } catch (error) {
            console.error('Error removing item:', error);
            alert('Failed to remove item. Please try again.');
        }
    }

    // Empty cart
    static async emptyCart() {
        if (!confirm('Are you sure you want to empty your entire cart?')) {
            return;
        }

        try {
            const response = await fetch('/api/cart/empty', {
                method: 'DELETE',
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                CartManager.showEmptyCart();
                document.getElementById('cart-container').style.display = 'none';
            } else {
                alert(result.message);
            }

        } catch (error) {
            console.error('Error emptying cart:', error);
            alert('Failed to empty cart. Please try again.');
        }
    }

    // Proceed to checkout
    static proceedToCheckout() {
        window.location.href = 'checkout.html';
    }

    // Update cart count (for navigation)
    static async updateCartCount() {
        try {
            const response = await fetch('/api/cart/count', {
                method: 'GET',
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                // Update cart count badge if it exists
                const cartBadge = document.getElementById('cart-count');
                if (cartBadge) {
                    cartBadge.textContent = result.count;
                }
            }

        } catch (error) {
            console.error('Error updating cart count:', error);
        }
    }
}