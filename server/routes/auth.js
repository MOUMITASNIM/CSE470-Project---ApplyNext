const express = require('express');
const { body } = require('express-validator');
const { protectUser } = require('../middleware/auth');
const {
  registerUser,
  loginUser,
  adminLogin,
  getCurrentUser,
  logoutUser,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
// Rate limiting temporarily disabled for testing
// const { authLimiter, resetLimiter } = require('../middleware/security');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email')
];

const resetPasswordValidation = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

// Routes
router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.post('/admin-login', loginValidation, adminLogin);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.put('/reset-password/:token', resetPasswordValidation, resetPassword);
router.get('/me', protectUser, getCurrentUser);
router.post('/logout', logoutUser); // Removed protectUser middleware

module.exports = router; 