// Form validation and registration handling
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('register-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Add loading state functionality
    function setLoading(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Registering...';
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register';
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
        name: {
            regex: /^[a-zA-Z\s]{2,100}$/,
            message: 'Name must contain only letters and spaces (2-100 characters)'
        },
        email: {
            regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        },
        password: {
            regex: /^.{6,150}$/,
            message: 'Password must be 6-150 characters long'
        },
        country: {
            regex: /^[a-zA-Z\s]{2,30}$/,
            message: 'Country must contain only letters and spaces (2-30 characters)'
        },
        city: {
            regex: /^[a-zA-Z\s]{2,30}$/,
            message: 'City must contain only letters and spaces (2-30 characters)'
        },
        phone_number: {
            regex: /^[\+]?[0-9\-\(\)\s]{10,15}$/,
            message: 'Please enter a valid phone number (10-15 digits)'
        }
    };

    // Real-time validation
    Object.keys(validators).forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            field.addEventListener('blur', function() {
                validateField(fieldName, this.value);
            });
        }
    });

    // Email availability check
    const emailField = document.getElementById('email');
    let emailCheckTimeout;

    emailField.addEventListener('input', function() {
        clearTimeout(emailCheckTimeout);
        const email = this.value.trim();
        
        if (email && validators.email.regex.test(email)) {
            emailCheckTimeout = setTimeout(() => {
                checkEmailAvailability(email);
            }, 500); // Check after 500ms of no typing
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

        // Skip validation if field is empty (except for required fields during submit)
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

    // Check email availability
    async function checkEmailAvailability(email) {
        try {
            const response = await fetch('/api/auth/check-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const result = await response.json();
            const emailField = document.getElementById('email');
            
            // Remove existing email status
            const existingStatus = emailField.parentNode.querySelector('.email-status');
            if (existingStatus) {
                existingStatus.remove();
            }

            if (result.success) {
                const statusDiv = document.createElement('div');
                statusDiv.className = 'email-status';
                statusDiv.style.cssText = `
                    font-size: 12px; 
                    margin-top: 5px;
                    ${result.available ? 'color: #155724;' : 'color: #721c24;'}
                `;
                statusDiv.textContent = result.message;
                emailField.parentNode.appendChild(statusDiv);
            }

        } catch (error) {
            console.error('Error checking email availability:', error);
        }
    }

    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            country: document.getElementById('country').value.trim(),
            city: document.getElementById('city').value.trim(),
            phone_number: document.getElementById('phone_number').value.trim(),
            role: document.querySelector('input[name="role"]:checked')?.id || 'customer'
        };

        // Validate all fields
        let isValid = true;
        Object.keys(validators).forEach(fieldName => {
            if (!validateField(fieldName, formData[fieldName])) {
                isValid = false;
            }
        });

        // Check for empty required fields
        const requiredFields = ['name', 'email', 'password', 'country', 'city', 'phone_number'];
        requiredFields.forEach(fieldName => {
            if (!formData[fieldName]) {
                const field = document.getElementById(fieldName);
                showFieldError(field, `${fieldName.replace('_', ' ')} is required`);
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
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                showMessage('Registration successful! Redirecting to login...', 'success');
                
                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showMessage(result.message, 'error');
            }

        } catch (error) {
            console.error('Registration error:', error);
            showMessage('Registration failed. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    });

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
    `;
    document.head.appendChild(style);
});