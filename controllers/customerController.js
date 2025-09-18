const Customer = require('../classes/Customer');

class CustomerController {
    constructor() {
        this.customerModel = new Customer();
    }

    // Register customer controller
    async registerCustomer(customerData) {
        try {
            // Validate required fields
            const requiredFields = ['name', 'email', 'password', 'country', 'city', 'phone_number'];
            const missingFields = requiredFields.filter(field => !customerData[field]);
            
            if (missingFields.length > 0) {
                return {
                    success: false,
                    message: `Missing required fields: ${missingFields.join(', ')}`
                };
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(customerData.email)) {
                return {
                    success: false,
                    message: 'Please enter a valid email address'
                };
            }

            // Validate password strength
            if (customerData.password.length < 6) {
                return {
                    success: false,
                    message: 'Password must be at least 6 characters long'
                };
            }

            // Validate phone number format (basic validation)
            const phoneRegex = /^[\+]?[0-9\-\(\)\s]+$/;
            if (!phoneRegex.test(customerData.phone_number)) {
                return {
                    success: false,
                    message: 'Please enter a valid phone number'
                };
            }

            // Check if email already exists
            const emailExists = await this.customerModel.emailExists(customerData.email);
            if (emailExists) {
                return {
                    success: false,
                    message: 'Email already exists. Please use a different email.'
                };
            }

            // Set user role based on selection
            if (customerData.role === 'owner') {
                customerData.role = 1; // Restaurant owner
            } else {
                customerData.role = 2; // Customer
            }

            // Register customer
            const result = await this.customerModel.addCustomer(customerData);
            return result;

        } catch (error) {
            console.error('Error in registerCustomer controller:', error);
            return {
                success: false,
                message: 'Registration failed. Please try again.'
            };
        }
    }

    // Check email availability
    async checkEmailAvailability(email) {
        try {
            const exists = await this.customerModel.emailExists(email);
            return {
                success: true,
                available: !exists,
                message: exists ? 'Email is already taken' : 'Email is available'
            };
        } catch (error) {
            console.error('Error checking email availability:', error);
            return {
                success: false,
                message: 'Could not check email availability'
            };
        }
    }

    // Get customer by ID
    async getCustomerById(customerId) {
        try {
            const customer = await this.customerModel.findById(customerId);
            if (customer) {
                // Remove password from response
                delete customer.customer_pass;
                return {
                    success: true,
                    customer: customer
                };
            } else {
                return {
                    success: false,
                    message: 'Customer not found'
                };
            }
        } catch (error) {
            console.error('Error getting customer by ID:', error);
            return {
                success: false,
                message: 'Could not retrieve customer information'
            };
        }
    }

    // Update customer
    async updateCustomer(customerId, updateData) {
        try {
            // Remove sensitive fields that shouldn't be updated directly
            delete updateData.customer_pass;
            delete updateData.customer_id;

            const result = await this.customerModel.updateCustomer(customerId, updateData);
            return result;
        } catch (error) {
            console.error('Error updating customer:', error);
            return {
                success: false,
                message: 'Update failed. Please try again.'
            };
        }
    }

    // Delete customer
    async deleteCustomer(customerId) {
        try {
            const result = await this.customerModel.deleteCustomer(customerId);
            return result;
        } catch (error) {
            console.error('Error deleting customer:', error);
            return {
                success: false,
                message: 'Deletion failed. Please try again.'
            };
        }
    }
}

module.exports = CustomerController;