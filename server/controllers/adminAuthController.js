const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { setTokenCookie } = require('../middleware/auth');

// @desc    Admin login with hardcoded credentials
// @route   POST /api/admin/login
// @access  Public
exports.adminLogin = async (req, res) => {
    try {
        console.log('Admin login attempt:', { email: req.body.email });
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Check hardcoded admin credentials
        if (email !== 'admin@gmail.com' || password !== 'admin123') {
            console.log('Invalid admin credentials attempt');
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials'
            });
        }

        // Create admin token with role claim
        const token = jwt.sign(
            { 
                id: 'admin',
                role: 'admin',
                email: 'admin@gmail.com'
            },
            process.env.JWT_ADMIN_SECRET,
            { expiresIn: '1d' }
        );
        
        // Set HTTP-only cookie for admin
        setTokenCookie(res, token, true);

        console.log('Admin login successful');
        res.json({
            success: true,
            message: 'Admin login successful',
            data: {
                user: {
                    id: 'admin',
                    email: 'admin@gmail.com',
                    role: 'admin'
                }
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during admin login'
        });
    }
};
