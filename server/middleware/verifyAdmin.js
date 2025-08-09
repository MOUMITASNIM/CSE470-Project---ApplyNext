const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyAdmin = async (req, res, next) => {
    try {
        // Get token from the cookies
        const token = req.cookies.adminToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Please log in as admin to access this section'
            });
        }

        try {
            // Verify token using admin secret with fallback
            const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET || 'your-admin-secret-key');
            
            if (decoded.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
            }

            // Attach admin info to request object
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role
            };
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Access denied.'
            });
        }
    } catch (error) {
        console.error('Admin verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during authentication'
        });
    }
};

module.exports = verifyAdmin;
