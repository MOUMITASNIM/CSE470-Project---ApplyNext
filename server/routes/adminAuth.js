const express = require('express');
const { body } = require('express-validator');
const { adminLogin } = require('../controllers/adminAuthController');
const verifyAdmin = require('../middleware/verifyAdmin');

const router = express.Router();

// Admin login validation
const adminLoginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
];

// Admin auth routes
router.post('/login', adminLoginValidation, adminLogin);

// Protected admin routes
router.use(verifyAdmin); // All routes below this will require admin authentication

// Admin dashboard data
router.get('/dashboard', (req, res) => {
    res.json({
        success: true,
        data: {
            message: 'Admin dashboard data',
            admin: req.user
        }
    });
});

module.exports = router;
