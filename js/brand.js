// Brand Management JavaScript
class BrandManager {
    
    // Show message to user
    static showMessage(message, type = 'error') {
        // Remove existing message
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        // Insert at top of container
        const container = document.querySelector('.container');
        const firstCard = container.querySelector('.stats');
        container.insertBefore(messageDiv, firstCard);

        // Auto remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // Validate brand name
    static validateBrandName(name) {
        const trimmedName = name.trim();
        
        if (!trimmedName) {
            return { valid: false, message: 'Brand name is required' };
        }
        
        if (trimmedName.length < 2) {
            return { valid: false, message: 'Brand name must be at least 2 characters long' };
        }
        
        if (trimmedName.length > 100) {
            return { valid: false, message: 'Brand name must not exceed 100 characters' };
        }
        
        // Check for valid characters
        const nameRegex = /^[a-zA-Z0-9\s\-&]+$/;
        if (!nameRegex.test(trimmedName)) {
            return { valid: false, message: 'Brand name can only contain letters, numbers, spaces, hyphens, and ampersands' };
        }
        
        return { valid: true, message: 'Brand name is valid' };
    }

    // Check if brand name is available
    static async checkNameAvailability(name, excludeId = null) {
        try {
            const response = await fetch('/api/brands/check-name', {
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

    // Load all brands
    static async loadBrands() {
        try {
            const response = await fetch('/api/brands', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch brands');
            }

            const result = await response.json();
            
            const container = document.getElementById('brands-container');
            const table = document.getElementById('brands-table');
            const tbody = document.getElementById('brands-body');
            
            if (result.success && result.brands.length > 0) {
                // Hide loading, show table
                container.style.display = 'none';
                table.style.display = 'table';
                
                // Clear existing rows
                tbody.innerHTML = '';
                
                // Add brands to table
                result.brands.forEach(brand => {
                    BrandManager.addBrandRow(brand);
                });
                
            } else {
                // Show no brands message
                container.innerHTML = '<div class="no-brands">No brands found. Create your first brand above.</div>';
                table.style.display = 'none';
            }

        } catch (error) {
            console.error('Error loading brands:', error);
            BrandManager.showMessage('Failed to load brands', 'error');
            
            const container = document.getElementById('brands-container');
            container.innerHTML = '<div class="no-brands">Error loading brands. Please refresh the page.</div>';
        }
    }

    // Add brand row to table
    static addBrandRow(brand) {
        const tbody = document.getElementById('brands-body');
        const row = document.createElement('tr');
        row.setAttribute('data-brand-id', brand.brand_id);
        
        row.innerHTML = `
            <td>${brand.brand_id}</td>
            <td>
                <span class="brand-name">${brand.brand_name}</span>
                <div class="edit-form" id="edit-form-${brand.brand_id}">
                    <div class="form-group">
                        <input type="text" value="${brand.brand_name}" id="edit-name-${brand.brand_id}" maxlength="100">
                        <div id="edit-feedback-${brand.brand_id}" style="margin-top: 5px; font-size: 12px;"></div>
                    </div>
                    <div class="actions">
                        <button class="btn btn-success btn-sm" onclick="BrandManager.saveBrand(${brand.brand_id})">Save</button>
                        <button class="btn btn-secondary btn-sm" onclick="BrandManager.cancelEdit(${brand.brand_id})">Cancel</button>
                    </div>
                </div>
            </td>
            <td>
                <div class="actions">
                    <button class="btn btn-primary btn-sm" onclick="BrandManager.startEdit(${brand.brand_id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="BrandManager.deleteBrand(${brand.brand_id})">Delete</button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    }

    // Add new brand
    static async addBrand(brandData) {
        try {
            const response = await fetch('/api/brands', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(brandData)
            });

            const result = await response.json();
            
            if (result.success) {
                BrandManager.showMessage(result.message, 'success');
                
                // Clear form
                document.getElementById('add-brand-form').reset();
                document.getElementById('name-feedback').textContent = '';
                
                // Reload brands and stats
                await BrandManager.loadBrands();
                await BrandManager.loadStats();
            } else {
                BrandManager.showMessage(result.message, 'error');
            }

        } catch (error) {
            console.error('Error adding brand:', error);
            BrandManager.showMessage('Failed to add brand. Please try again.', 'error');
        }
    }

    // Start editing brand
    static startEdit(brandId) {
        const editForm = document.getElementById(`edit-form-${brandId}`);
        const nameSpan = editForm.parentNode.querySelector('.brand-name');
        
        editForm.classList.add('show');
        nameSpan.style.display = 'none';
        
        // Focus on input
        const input = document.getElementById(`edit-name-${brandId}`);
        input.focus();
        input.select();
    }

    // Cancel editing
    static cancelEdit(brandId) {
        const editForm = document.getElementById(`edit-form-${brandId}`);
        const nameSpan = editForm.parentNode.querySelector('.brand-name');
        
        editForm.classList.remove('show');
        nameSpan.style.display = 'inline';
        
        // Clear feedback
        document.getElementById(`edit-feedback-${brandId}`).textContent = '';
    }

    // Save brand changes
    static async saveBrand(brandId) {
        const input = document.getElementById(`edit-name-${brandId}`);
        const newName = input.value.trim();
        const feedback = document.getElementById(`edit-feedback-${brandId}`);
        
        // Validate name
        const validation = BrandManager.validateBrandName(newName);
        if (!validation.valid) {
            feedback.style.color = '#dc3545';
            feedback.textContent = validation.message;
            return;
        }
        
        // Check availability
        const availability = await BrandManager.checkNameAvailability(newName, brandId);
        if (!availability.available) {
            feedback.style.color = '#dc3545';
            feedback.textContent = availability.message;
            return;
        }
        
        try {
            const response = await fetch(`/api/brands/${brandId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ name: newName })
            });

            const result = await response.json();
            
            if (result.success) {
                BrandManager.showMessage(result.message, 'success');
                
                // Update display
                const nameSpan = input.closest('td').querySelector('.brand-name');
                nameSpan.textContent = newName;
                
                // Cancel edit mode
                BrandManager.cancelEdit(brandId);
                
                await BrandManager.loadStats();
            } else {
                feedback.style.color = '#dc3545';
                feedback.textContent = result.message;
            }

        } catch (error) {
            console.error('Error updating brand:', error);
            feedback.style.color = '#dc3545';
            feedback.textContent = 'Failed to update brand. Please try again.';
        }
    }

    // Delete brand
    static async deleteBrand(brandId) {
        const brandRow = document.querySelector(`tr[data-brand-id="${brandId}"]`);
        const brandName = brandRow.querySelector('.brand-name').textContent;
        
        if (!confirm(`Are you sure you want to delete the brand "${brandName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/brands/${brandId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                BrandManager.showMessage(result.message, 'success');
                
                // Remove row from table
                brandRow.remove();
                
                // Check if table is empty
                const tbody = document.getElementById('brands-body');
                if (tbody.children.length === 0) {
                    const container = document.getElementById('brands-container');
                    const table = document.getElementById('brands-table');
                    
                    container.innerHTML = '<div class="no-brands">No brands found. Create your first brand above.</div>';
                    container.style.display = 'block';
                    table.style.display = 'none';
                }
                
                await BrandManager.loadStats();
            } else {
                BrandManager.showMessage(result.message, 'error');
            }

        } catch (error) {
            console.error('Error deleting brand:', error);
            BrandManager.showMessage('Failed to delete brand. Please try again.', 'error');
        }
    }

    // Load statistics
    static async loadStats() {
        try {
            const response = await fetch('/api/brands/admin/stats', {
                method: 'GET',
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                document.getElementById('total-brands').textContent = result.stats.total;
            }

        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }
}

// Initialize form handlers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const addForm = document.getElementById('add-brand-form');
    const nameInput = document.getElementById('brand-name');
    const nameFeedback = document.getElementById('name-feedback');
    
    // Real-time name validation
    let nameCheckTimeout;
    nameInput.addEventListener('input', function() {
        clearTimeout(nameCheckTimeout);
        const name = this.value.trim();
        
        if (!name) {
            nameFeedback.textContent = '';
            return;
        }
        
        // Validate format first
        const validation = BrandManager.validateBrandName(name);
        if (!validation.valid) {
            nameFeedback.style.color = '#dc3545';
            nameFeedback.textContent = validation.message;
            return;
        }
        
        // Check availability after 500ms of no typing
        nameCheckTimeout = setTimeout(async () => {
            const availability = await BrandManager.checkNameAvailability(name);
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
        
        // Final validation
        const validation = BrandManager.validateBrandName(formData.name);
        if (!validation.valid) {
            BrandManager.showMessage(validation.message, 'error');
            return;
        }
        
        // Check availability one more time
        const availability = await BrandManager.checkNameAvailability(formData.name);
        if (!availability.available) {
            BrandManager.showMessage(availability.message, 'error');
            return;
        }
        
        // Submit
        await BrandManager.addBrand(formData);
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