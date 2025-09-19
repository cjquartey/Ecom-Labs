// Login form validation and submission handling
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('login-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Add loading state functionality
    function setLoading(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    }

    // Display messages to user
    function showMessage(message, type = 'error') {
        // Remove existing message
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.style.cssText = `
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            ${type === 'success' ? 'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 
              'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'}
        `;
        messageDiv.textContent = message;

        form.insertBefore(messageDiv, form.firstChild);

        // Auto remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // Validation functions using regex
    const validators = {
        email: {
            regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        },
        password: {
            regex: /^.+$/,
            message: 'Password is required'
        }
    };

    // Real-time validation
    Object.keys(validators).forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            field.addEventListener('blur', function() {
                validateField(fieldName, this.value);
            });

            // Remove error styling on focus
            field.addEventListener('focus', function() {
                this.classList.remove('error');
                const existingError = this.parentNode.querySelector('.field-error');
                if (existingError) {
                    existingError.remove();
                }
            });
        }
    });

    // Validate individual field
    function validateField(fieldName, value) {
        const field = document.getElementById(fieldName);
        const validator = validators[fieldName];
        
        // Remove existing error styling
        field.classList.remove('error', 'success');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // Skip validation if field is empty
        if (!value.trim()) {
            return true;
        }

        // Validate
        if (!validator.regex.test(value.trim())) {
            showFieldError(field, validator.message);
            return false;
        } else {
            field.classList.add('success');
            return true;
        }
    }

    // Show field-specific error
    function showFieldError(field, message) {
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = 'color: #721c24; font-size: 12px; margin-top: 5px;';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }

    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value
        };

        // Validate all fields
        let isValid = true;

        // Check for empty required fields
        const requiredFields = ['email', 'password'];
        requiredFields.forEach(fieldName => {
            if (!formData[fieldName]) {
                const field = document.getElementById(fieldName);
                showFieldError(field, `${fieldName.replace('_', ' ')} is required`);
                isValid = false;
            } else if (!validateField(fieldName, formData[fieldName])) {
                isValid = false;
            }
        });

        if (!isValid) {
            showMessage('Please fix the errors above', 'error');
            return;
        }

        // Submit form
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Important for session cookies
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                showMessage('Login successful! Redirecting...', 'success');
                
                // Store user data in sessionStorage for immediate use
                sessionStorage.setItem('user', JSON.stringify(result.user));
                
                // Redirect to homepage after 1.5 seconds
                setTimeout(() => {
                    window.location.href = result.redirectUrl || '/';
                }, 1500);
            } else {
                showMessage(result.message, 'error');
            }

        } catch (error) {
            console.error('Login error:', error);
            showMessage('Login failed. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    });

    // Add CSS for validation styling
    const style = document.createElement('style');
    style.textContent = `
        .field-value input.error {
            border: 2px solid #dc3545;
            background-color: #f8d7da;
        }
        .field-value input.success {
            border: 2px solid #28a745;
            background-color: #d4edda;
        }
        .field-value input:focus {
            outline: none;
            border-color: #007bff;
        }
        .field-value input {
            transition: border-color 0.3s ease, background-color 0.3s ease;
        }
    `;
    document.head.appendChild(style);
});