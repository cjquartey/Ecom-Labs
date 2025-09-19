// Authentication utilities for all pages
class Auth {
    // Check if user is logged in
    static async checkAuthStatus() {
        try {
            const response = await fetch('/api/auth/status', {
                method: 'GET',
                credentials: 'include'
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error checking auth status:', error);
            return { success: false, isLoggedIn: false, user: null };
        }
    }

    // Get current user
    static async getCurrentUser() {
        try {
            const response = await fetch('/api/auth/user', {
                method: 'GET',
                credentials: 'include'
            });
            
            if (response.ok) {
                const result = await response.json();
                return result.user;
            }
            return null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    // Logout function
    static async logout() {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Clear any client-side storage
                sessionStorage.clear();
                localStorage.removeItem('user');
                
                // Redirect to home page
                window.location.href = '/';
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error during logout:', error);
            return false;
        }
    }

    // Update navigation based on auth status
    static async updateNavigation() {
        const authStatus = await Auth.checkAuthStatus();
        const navBar = document.getElementById('nav-bar');
        
        if (!navBar) return;

        const ul = navBar.querySelector('ul');
        if (!ul) return;

        // Clear existing auth-related nav items
        const existingAuthItems = ul.querySelectorAll('[data-auth-item]');
        existingAuthItems.forEach(item => item.remove());

        if (authStatus.isLoggedIn && authStatus.user) {
            // User is logged in - show user menu
            const welcomeItem = document.createElement('li');
            welcomeItem.setAttribute('data-auth-item', 'true');
            welcomeItem.innerHTML = `<span style="color: #007bff;">Welcome, ${authStatus.user.name}</span>`;
            
            const logoutItem = document.createElement('li');
            logoutItem.setAttribute('data-auth-item', 'true');
            logoutItem.innerHTML = '<a href="#" id="logout-btn">Logout</a>';
            
            ul.appendChild(welcomeItem);
            ul.appendChild(logoutItem);
            
            // Add logout event listener
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async function(e) {
                    e.preventDefault();
                    const success = await Auth.logout();
                    if (!success) {
                        alert('Logout failed. Please try again.');
                    }
                });
            }
        } else {
            // User is not logged in - show login/register links
            const loginItem = document.createElement('li');
            loginItem.setAttribute('data-auth-item', 'true');
            loginItem.innerHTML = '<a href="/login/login.html">Login</a>';
            
            const registerItem = document.createElement('li');
            registerItem.setAttribute('data-auth-item', 'true');
            registerItem.innerHTML = '<a href="/login/register.html">Register</a>';
            
            ul.appendChild(loginItem);
            ul.appendChild(registerItem);
        }
    }

    // Check if user has specific role
    static async hasRole(requiredRole) {
        const user = await Auth.getCurrentUser();
        return user && user.role === requiredRole;
    }

    // Check if user is admin
    static async isAdmin() {
        return await Auth.hasRole(1);
    }

    // Check if user is customer
    static async isCustomer() {
        return await Auth.hasRole(2);
    }

    // Redirect to login if not authenticated
    static async requireAuth() {
        const authStatus = await Auth.checkAuthStatus();
        if (!authStatus.isLoggedIn) {
            window.location.href = '/login/login.html';
            return false;
        }
        return true;
    }

    // Redirect to home if already authenticated
    static async redirectIfAuthenticated() {
        const authStatus = await Auth.checkAuthStatus();
        if (authStatus.isLoggedIn) {
            window.location.href = '/';
            return true;
        }
        return false;
    }
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', function() {
    // Update navigation for all pages
    Auth.updateNavigation();
    
    // For login and register pages, redirect if already logged in
    const currentPage = window.location.pathname;
    if (currentPage.includes('login.html') || currentPage.includes('register.html')) {
        Auth.redirectIfAuthenticated();
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}