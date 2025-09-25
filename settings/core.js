class Core {
    
    static isUserLoggedIn(req) {
        // Check if session exists and has user data
        if (req.session && req.session.isLoggedIn === true && req.session.user) {
            return true;
        }
        return false;
    }

    static isUserAdmin(req) {
        // First check if user is logged in
        if (!Core.isUserLoggedIn(req)) {
            return false;
        }
        
        // Check if user role is admin (role 1 = admin)
        return req.session.user.role === 1;
    }

    static isUserCustomer(req) {
        // First check if user is logged in
        if (!Core.isUserLoggedIn(req)) {
            return false;
        }
        
        // Check if user role is customer (role 2 = customer)
        return req.session.user.role === 2;
    }

    static getCurrentUser(req) {
        if (Core.isUserLoggedIn(req)) {
            return req.session.user;
        }
        return null;
    }

    static getUserRoleName(req) {
        if (!Core.isUserLoggedIn(req)) {
            return 'guest';
        }
        
        const role = req.session.user.role;
        switch(role) {
            case 1:
                return 'admin';
            case 2:
                return 'customer';
            default:
                return 'unknown';
        }
    }

    static requireLogin(req, res, next) {
        if (Core.isUserLoggedIn(req)) {
            next(); // User is logged in, continue
        } else {
            // User not logged in, send error response
            res.status(401).json({
                success: false,
                message: 'You must be logged in to access this resource',
                redirectUrl: '/login/login.html'
            });
        }
    }

    static requireAdmin(req, res, next) {
        if (!Core.isUserLoggedIn(req)) {
            // Not logged in at all
            return res.status(401).json({
                success: false,
                message: 'You must be logged in to access this resource',
                redirectUrl: '/login/login.html'
            });
        }
        
        if (Core.isUserAdmin(req)) {
            next(); // User is admin, continue
        } else {
            // User is logged in but not admin
            res.status(403).json({
                success: false,
                message: 'Admin privileges required to access this resource'
            });
        }
    }

    static createResponse(success, message, data = null) {
        const response = {
            success: success,
            message: message
        };
        
        if (data !== null) {
            response.data = data;
        }
        
        return response;
    }
}

module.exports = Core;