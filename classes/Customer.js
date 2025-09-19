const database = require('../db/connection');
const bcrypt = require('bcryptjs');

class Customer {
    constructor() {
        this.tableName = 'customer';
    }

    // Add new customer
    async addCustomer(customerData) {
        try {
            const connection = await database.getConnection();
            
            // Hash password before storing
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(customerData.password, saltRounds);

            const query = `
                INSERT INTO ${this.tableName} 
                (customer_name, customer_email, customer_pass, customer_country, 
                 customer_city, customer_contact, user_role) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                customerData.name,
                customerData.email,
                hashedPassword,
                customerData.country,
                customerData.city,
                customerData.phone_number,
                customerData.role || 2 // Default to customer role
            ];

            const [result] = await connection.execute(query, values);
            return {
                success: true,
                customer_id: result.insertId,
                message: 'Customer registered successfully'
            };

        } catch (error) {
            console.error('Error adding customer:', error);
            
            // Handle duplicate email error
            if (error.code === 'ER_DUP_ENTRY') {
                return {
                    success: false,
                    message: 'Email already exists. Please use a different email.'
                };
            }
            
            return {
                success: false,
                message: 'Registration failed. Please try again.'
            };
        }
    }

    // Check if email exists
    async emailExists(email) {
        try {
            const connection = await database.getConnection();
            const query = `SELECT customer_id FROM ${this.tableName} WHERE customer_email = ?`;
            const [rows] = await connection.execute(query, [email]);
            return rows.length > 0;
        } catch (error) {
            console.error('Error checking email:', error);
            return false;
        }
    }

    // Find customer by email
    async findByEmail(email) {
        try {
            const connection = await database.getConnection();
            const query = `SELECT * FROM ${this.tableName} WHERE customer_email = ?`;
            const [rows] = await connection.execute(query, [email]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error finding customer by email:', error);
            return null;
        }
    }

    // Login customer - verify credentials and return customer data
    async loginCustomer(email, password) {
        try {
            // Find customer by email
            const customer = await this.findByEmail(email);
            
            if (!customer) {
                return {
                    success: false,
                    message: 'Invalid email or password'
                };
            }

            // Check password
            const passwordMatch = await bcrypt.compare(password, customer.customer_pass);
            
            if (!passwordMatch) {
                return {
                    success: false,
                    message: 'Invalid email or password'
                };
            }

            // Remove password from response
            const customerData = { ...customer };
            delete customerData.customer_pass;

            return {
                success: true,
                customer: customerData,
                message: 'Login successful'
            };

        } catch (error) {
            console.error('Error during customer login:', error);
            return {
                success: false,
                message: 'Login failed. Please try again.'
            };
        }
    }

    // Verify customer password
    async verifyPassword(email, password) {
        try {
            const customer = await this.findByEmail(email);
            if (!customer) {
                return false;
            }
            
            return await bcrypt.compare(password, customer.customer_pass);
        } catch (error) {
            console.error('Error verifying password:', error);
            return false;
        }
    }

    // Find customer by ID
    async findById(customerId) {
        try {
            const connection = await database.getConnection();
            const query = `SELECT * FROM ${this.tableName} WHERE customer_id = ?`;
            const [rows] = await connection.execute(query, [customerId]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error finding customer by ID:', error);
            return null;
        }
    }

    // Update customer
    async updateCustomer(customerId, updateData) {
        try {
            const connection = await database.getConnection();
            
            const updateFields = [];
            const values = [];
            
            // Build dynamic update query
            Object.keys(updateData).forEach(key => {
                if (updateData[key] !== undefined) {
                    updateFields.push(`${key} = ?`);
                    values.push(updateData[key]);
                }
            });
            
            if (updateFields.length === 0) {
                return { success: false, message: 'No fields to update' };
            }
            
            values.push(customerId);
            const query = `UPDATE ${this.tableName} SET ${updateFields.join(', ')} WHERE customer_id = ?`;
            
            const [result] = await connection.execute(query, values);
            
            return {
                success: result.affectedRows > 0,
                message: result.affectedRows > 0 ? 'Customer updated successfully' : 'Customer not found'
            };
            
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
            const connection = await database.getConnection();
            const query = `DELETE FROM ${this.tableName} WHERE customer_id = ?`;
            const [result] = await connection.execute(query, [customerId]);
            
            return {
                success: result.affectedRows > 0,
                message: result.affectedRows > 0 ? 'Customer deleted successfully' : 'Customer not found'
            };
            
        } catch (error) {
            console.error('Error deleting customer:', error);
            return {
                success: false,
                message: 'Deletion failed. Please try again.'
            };
        }
    }
}

module.exports = Customer;
