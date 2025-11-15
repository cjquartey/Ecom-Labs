// Checkout Management JavaScript
class CheckoutManager {
    static cartItems = [];
    static totalAmount = 0;

    // Load checkout
    static async loadCheckout() {
        try {
            const response = await fetch('/api/cart', {
                method: 'GET',
                credentials: 'include'
            });

            const result = await response.json();
            
            document.getElementById('loading-container').style.display = 'none';

            if (result.success && result.cart_items.length > 0) {
                CheckoutManager.cartItems = result.cart_items;
                CheckoutManager.displayCheckout(result.cart_items);
            } else {
                alert('Your cart is empty!');
                window.location.href = 'cart.html';
            }

        } catch (error) {
            console.error('Error loading checkout:', error);
            alert('Failed to load checkout. Please try again.');
            window.location.href = 'cart.html';
        }
    }

    // Display checkout items
    static displayCheckout(items) {
        const container = document.getElementById('checkout-container');
        const itemsContainer = document.getElementById('order-items');
        
        container.style.display = 'block';
        itemsContainer.innerHTML = '';

        let subtotal = 0;

        items.forEach(item => {
            const itemSubtotal = parseFloat(item.product_price) * parseInt(item.qty);
            subtotal += itemSubtotal;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'order-item';
            itemDiv.innerHTML = `
                <div class="item-details">
                    <img src="${item.product_image || '/images/placeholder.png'}" 
                         alt="${item.product_title}" 
                         class="item-image"
                         onerror="this.src='/images/placeholder.png'">
                    <div class="item-info">
                        <h4>${item.product_title}</h4>
                        <p>${item.cat_name} - ${item.brand_name}</p>
                    </div>
                </div>
                <div class="item-price">
                    <div class="price">$${itemSubtotal.toFixed(2)}</div>
                    <div class="qty">Qty: ${item.qty} × $${parseFloat(item.product_price).toFixed(2)}</div>
                </div>
            `;
            itemsContainer.appendChild(itemDiv);
        });

        // Update summary
        CheckoutManager.totalAmount = subtotal;
        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('total').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('modal-total').textContent = `$${subtotal.toFixed(2)}`;
    }

    // Show payment modal
    static showPaymentModal() {
        document.getElementById('payment-modal').style.display = 'block';
    }

    // Close payment modal
    static closePaymentModal() {
        document.getElementById('payment-modal').style.display = 'none';
    }

    // Confirm payment
    static async confirmPayment() {
        try {
            // Close payment modal
            CheckoutManager.closePaymentModal();

            // Show loading state
            const checkoutContainer = document.getElementById('checkout-container');
            checkoutContainer.innerHTML = '<div class="loading">Processing your order...</div>';

            // Process checkout
            const response = await fetch('/api/orders/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                // Show success modal
                document.getElementById('order-reference').textContent = `#${result.invoice_no}`;
                document.getElementById('success-modal').style.display = 'block';
            } else {
                alert('Payment failed: ' + result.message);
                window.location.href = 'cart.html';
            }

        } catch (error) {
            console.error('Error processing checkout:', error);
            alert('Checkout failed. Please try again.');
            window.location.href = 'cart.html';
        }
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const paymentModal = document.getElementById('payment-modal');
    const successModal = document.getElementById('success-modal');
    
    if (event.target === paymentModal) {
        CheckoutManager.closePaymentModal();
    }
}