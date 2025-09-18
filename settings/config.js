// Application configuration settings
require('dotenv').config();

const config = {
    // Database configuration
    database: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'shoppn',
        connectionLimit: 10
    },

    // Server configuration
    server: {
        port: process.env.PORT || 3000,
        environment: process.env.NODE_ENV || 'development'
    },

    // Security configuration
    security: {
        jwtSecret: process.env.JWT_SECRET,
        bcryptRounds: 10,
        sessionTimeout: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    },

    // Validation rules
    validation: {
        customer: {
            name: {
                minLength: 2,
                maxLength: 100,
                regex: /^[a-zA-Z\s]+$/
            },
            email: {
                maxLength: 50,
                regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            },
            password: {
                minLength: 6,
                maxLength: 150
            },
            country: {
                minLength: 2,
                maxLength: 30,
                regex: /^[a-zA-Z\s]+$/
            },
            city: {
                minLength: 2,
                maxLength: 30,
                regex: /^[a-zA-Z\s]+$/
            },
            contact: {
                minLength: 10,
                maxLength: 15,
                regex: /^[\+]?[0-9\-\(\)\s]+$/
            }
        }
    },

    // User roles
    userRoles: {
        ADMIN: 1,
        CUSTOMER: 2
    },

    // API response messages
    messages: {
        registration: {
            success: 'Customer registered successfully',
            emailExists: 'Email already exists. Please use a different email.',
            validationFailed: 'Please check your input and try again',
            serverError: 'Registration failed. Please try again.'
        },
        validation: {
            required: 'This field is required',
            invalidEmail: 'Please enter a valid email address',
            passwordTooShort: 'Password must be at least 6 characters long',
            invalidPhone: 'Please enter a valid phone number',
            invalidName: 'Name must contain only letters and spaces',
            invalidCountryCity: 'Must contain only letters and spaces'
        }
    }
};

module.exports = config;