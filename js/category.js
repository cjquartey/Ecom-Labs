// Category Management JavaScript
class CategoryManager {
    
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
        const firstCard = container.querySelector('.card');
        container.insertBefore(messageDiv, firstCard);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // Validate category name
    static validateCategoryName(name) {
        const trimmedName = name.trim();
        
        if (!trimmedName) {
            return { valid: false, message: 'Category name is required' };
        }
        
        if (trimmedName.length < 2) {
            return { valid: false, message: 'Category name must be at least 2 characters long' };
        }
        
        if (trimmedName.length > 100) {
            return { valid: false, message: 'Category name must not exceed 100 characters' };
        }
        
        const nameRegex = /^[a-zA-Z0-9\s\-&]+$/;
        if (!nameRegex.test(trimmedName)) {
            return { valid: false, message: 'Category name can only contain letters, numbers, spaces, hyphens, and ampersands' };
        }
        
        return { valid: true, message: 'Category name is valid' };
    }

    // Check if category name is available
    static async checkNameAvailability(name, excludeId = null) {
        try {
            const response = await fetch('/api/categories/check-name', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ name, excludeId })
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error checking name availability:', error);
            return { success: false, message: 'Could not check name availability' };
        }
    }

    // Load all categories
    static async loadCategories() {
        try {
            const response = await fetch('/api/categories', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }

            const result = await response.json();
            
            const container = document.getElementById('categories-container');
            const table = document.getElementById('categories-table');
            const tbody = document.getElementById('categories-body');
            
            if (result.success && result.categories.length > 0) {
                container.style.display = 'none';
                table.style.display = 'table';
                
                tbody.innerHTML = '';
                
                result.categories.forEach(category => {
                    CategoryManager.addCategoryRow(category);
                });
                
            } else {
                container.innerHTML = '<div class="no-categories">No categories found. Create your first category above.</div>';
                table.style.display = 'none';
            }

        } catch (error) {
            console.error('Error loading categories:', error);
            CategoryManager.showMessage('Failed to load categories', 'error');
            
            const container = document.getElementById('categories-container');
            container.innerHTML = '<div class="no-categories">Error loading categories. Please refresh the page.</div>';
        }
    }

    // Add category row to table
    static addCategoryRow(category) {
        const tbody = document.getElementById('categories-body');
        const row = document.createElement('tr');
        row.setAttribute('data-category-id', category.cat_id);
        
        row.innerHTML = `
            <td>${category.cat_id}</td>
            <td>
                <span class="category-name">${category.cat_name}</span>
                <div class="edit-form" id="edit-form-${category.cat_id}">
                    <div class="form-group">
                        <input type="text" value="${category.cat_name}" id="edit-name-${category.cat_id}" maxlength="100">
                        <div id="edit-feedback-${category.cat_id}" style="margin-top: 5px; font-size: 12px;"></div>
                    </div>
                    <div class="actions">
                        <button class="btn btn-success btn-sm" onclick="CategoryManager.saveCategory(${category.cat_id})">Save</button>
                        <button class="btn btn-secondary btn-sm" onclick="CategoryManager.cancelEdit(${category.cat_id})">Cancel</button>
                    </div>
                </div>
            </td>
            <td>
                <div class="actions">
                    <button class="btn btn-primary btn-sm" onclick="CategoryManager.startEdit(${category.cat_id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="CategoryManager.deleteCategory(${category.cat_id})">Delete</button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    }

    // Add new category
    static async addCategory(categoryData) {
        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(categoryData)
            });

            const result = await response.json();
            
            if (result.success) {
                CategoryManager.showMessage(result.message, 'success');
                
                document.getElementById('add-category-form').reset();
                document.getElementById('name-feedback').textContent = '';
                
                await CategoryManager.loadCategories();
                await CategoryManager.loadStats();
            } else {
                CategoryManager.showMessage(result.message, 'error');
            }

        } catch (error) {
            console.error('Error adding category:', error);
            CategoryManager.showMessage('Failed to add category. Please try again.', 'error');
        }
    }

    // Start editing category
    static startEdit(categoryId) {
        const editForm = document.getElementById(`edit-form-${categoryId}`);
        const nameSpan = editForm.parentNode.querySelector('.category-name');
        
        editForm.classList.add('show');
        nameSpan.style.display = 'none';
        
        const input = document.getElementById(`edit-name-${categoryId}`);
        input.focus();
        input.select();
    }

    // Cancel editing
    static cancelEdit(categoryId) {
        const editForm = document.getElementById(`edit-form-${categoryId}`);
        const nameSpan = editForm.parentNode.querySelector('.category-name');
        
        editForm.classList.remove('show');
        nameSpan.style.display = 'inline';
        
        document.getElementById(`edit-feedback-${categoryId}`).textContent = '';
    }

    // Save category changes
    static async saveCategory(categoryId) {
        const input = document.getElementById(`edit-name-${categoryId}`);
        const newName = input.value.trim();
        const feedback = document.getElementById(`edit-feedback-${categoryId}`);
        
        const validation = CategoryManager.validateCategoryName(newName);
        if (!validation.valid) {
            feedback.style.color = '#dc3545';
            feedback.textContent = validation.message;
            return;
        }
        
        const availability = await CategoryManager.checkNameAvailability(newName, categoryId);
        if (!availability.available) {
            feedback.style.color = '#dc3545';
            feedback.textContent = availability.message;
            return;
        }
        
        try {
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ name: newName })
            });

            const result = await response.json();
            
            if (result.success) {
                CategoryManager.showMessage(result.message, 'success');
                
                const nameSpan = input.closest('td').querySelector('.category-name');
                nameSpan.textContent = newName;
                
                CategoryManager.cancelEdit(categoryId);
                
                await CategoryManager.loadStats();
            } else {
                feedback.style.color = '#dc3545';
                feedback.textContent = result.message;
            }

        } catch (error) {
            console.error('Error updating category:', error);
            feedback.style.color = '#dc3545';
            feedback.textContent = 'Failed to update category. Please try again.';
        }
    }

    // Delete category
    static async deleteCategory(categoryId) {
        const categoryRow = document.querySelector(`tr[data-category-id="${categoryId}"]`);
        const categoryName = categoryRow.querySelector('.category-name').textContent;
        
        if (!confirm(`Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                CategoryManager.showMessage(result.message, 'success');
                
                categoryRow.remove();
                
                const tbody = document.getElementById('categories-body');
                if (tbody.children.length === 0) {
                    const container = document.getElementById('categories-container');
                    const table = document.getElementById('categories-table');
                    
                    container.innerHTML = '<div class="no-categories">No categories found. Create your first category above.</div>';
                    container.style.display = 'block';
                    table.style.display = 'none';
                }
                
                await CategoryManager.loadStats();
            } else {
                CategoryManager.showMessage(result.message, 'error');
            }

        } catch (error) {
            console.error('Error deleting category:', error);
            CategoryManager.showMessage('Failed to delete category. Please try again.', 'error');
        }
    }

    // Load statistics
    static async loadStats() {
        try {
            const response = await fetch('/api/categories/admin/stats', {
                method: 'GET',
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                document.getElementById('total-categories').textContent = result.stats.total;
            }

        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }
}

// Initialize form handlers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const addForm = document.getElementById('add-category-form');
    const nameInput = document.getElementById('category-name');
    const nameFeedback = document.getElementById('name-feedback');
    
    let nameCheckTimeout;
    nameInput.addEventListener('input', function() {
        clearTimeout(nameCheckTimeout);
        const name = this.value.trim();
        
        if (!name) {
            nameFeedback.textContent = '';
            return;
        }
        
        const validation = CategoryManager.validateCategoryName(name);
        if (!validation.valid) {
            nameFeedback.style.color = '#dc3545';
            nameFeedback.textContent = validation.message;
            return;
        }
        
        nameCheckTimeout = setTimeout(async () => {
            const availability = await CategoryManager.checkNameAvailability(name);
            if (availability.success) {
                nameFeedback.style.color = availability.available ? '#28a745' : '#dc3545';
                nameFeedback.textContent = availability.message;
            }
        }, 500);
    });
    
    // Form submission
    addForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            name: nameInput.value.trim()
        };
        
        const validation = CategoryManager.validateCategoryName(formData.name);
        if (!validation.valid) {
            CategoryManager.showMessage(validation.message, 'error');
            return;
        }

        const availability = await CategoryManager.checkNameAvailability(formData.name);
        if (!availability.available) {
            CategoryManager.showMessage(availability.message, 'error');
            return;
        }

        await CategoryManager.addCategory(formData);
    });
    
    // Logout handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            await Auth.logout();
        });
    }
});