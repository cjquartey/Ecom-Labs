const session = require('express-session');

class SessionManager {
    constructor() {
        this.sessionConfig = {
            secret: process.env.JWT_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: false,
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            },
            name: 'ecommerce_session'
        };
    }

    // Get session middleware
    getSessionMiddleware() {
        return session(this.sessionConfig);
    }

    // Create user session
    static createUserSession(req, customer) {
        req.session.user = {
            id: customer.customer_id,
            name: customer.customer_name,
            email: customer.customer_email,
            role: customer.user_role,
            country: customer.customer_country,
            city: customer.customer_city,
            contact: customer.customer_contact,
            loginTime: new Date()
        };
        
        req.session.isLoggedIn = true;
        return req.session.user;
    }

    // Check if user is logged in
    static isLoggedIn(req) {
        return req.session && req.session.isLoggedIn === true && req.session.user;
    }

    // Get current user
    static getCurrentUser(req) {
        if (SessionManager.isLoggedIn(req)) {
            return req.session.user;
        }
        return null;
    }

    // Destroy user session (logout)
    static destroySession(req) {
        return new Promise((resolve, reject) => {
            req.session.destroy((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    // Check if user has required role
    static hasRole(req, requiredRole) {
        const user = SessionManager.getCurrentUser(req);
        return user && user.role === requiredRole;
    }

    // Check if user is admin
    static isAdmin(req) {
        return SessionManager.hasRole(req, 1); // Admin role is 1
    }

    // Check if user is customer
    static isCustomer(req) {
        return SessionManager.hasRole(req, 2); // Customer role is 2
    }

    // Middleware to require authentication
    static requireAuth(req, res, next) {
        if (SessionManager.isLoggedIn(req)) {
            next();
        } else {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
    }

    // Middleware to require admin role
    static requireAdmin(req, res, next) {
        if (SessionManager.isAdmin(req)) {
            next();
        } else {
            res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
    }

    // Update session data
    static updateSession(req, updates) {
        if (SessionManager.isLoggedIn(req)) {
            Object.assign(req.session.user, updates);
            return req.session.user;
        }
        return null;
    }
}

module.exports = SessionManager;