const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { setTokenCookie } = require('../middleware/auth');
const clearTokenCookies = require('../utils/clearCookies');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/sendEmail');

// Generate JWT Token
const generateToken = (id, secret) => {
  return jwt.sign({ id }, secret, {
    expiresIn: '24h'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    console.log('Registration attempt:', { ...req.body, password: '[REDACTED]' });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user instance
    const user = new User({
      name,
      email,
      password,
      role: 'user', // Explicitly set role as user
      isActive: true
    });

    try {
      // Save user to database
      console.log('Attempting to save user:', { name, email });
      const savedUser = await user.save();
      
      if (!savedUser) {
        console.error('User save failed - no document returned');
        return res.status(500).json({
          success: false,
          message: 'Failed to create user account'
        });
      }
      
      console.log('User saved successfully:', { id: savedUser._id });

      // Generate token only after successful save
      const token = generateToken(savedUser._id, process.env.JWT_SECRET || 'fallback-secret');
      console.log('Token generated for user:', { id: savedUser._id });
      
      // Set HTTP-only cookie
      setTokenCookie(res, token, false);
      
      res.status(200).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
            role: savedUser.role
          }
        }
      });
    } catch (saveError) {
      console.error('User save error:', saveError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create user account'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email });
    
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

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user ? { id: user._id, email: user.email } : 'No user found');
    
    if (!user || !user.isActive || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();
    console.log('Updated last login for user:', { id: user._id });

    const token = generateToken(user._id, process.env.JWT_SECRET || 'fallback-secret');
    console.log('Generated token for user:', { id: user._id });
    
    // Set HTTP-only cookie
    setTokenCookie(res, token, false);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res) => {
  try {
    // Clear all auth cookies regardless of auth status
    clearTokenCookies(res);
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error, try to clear cookies
    try {
      clearTokenCookies(res);
    } catch (e) {
      console.error('Error clearing cookies:', e);
    }
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }
};

// @desc    Admin login
// @route   POST /api/auth/admin-login
// @access  Public
const adminLogin = async (req, res) => {
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

    // Clear any existing user tokens first
    clearTokenCookies(res);

    const { email, password } = req.body;

    // Hardcoded admin credentials
    const ADMIN_EMAIL = 'admin@admin.com';
    const ADMIN_PASSWORD = 'admin123';
    const ADMIN_SECRET = 'your-admin-secret-key'; // Fallback if JWT_ADMIN_SECRET not set

    // Check hardcoded admin credentials
    const isValidAdmin = email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
    
    if (!isValidAdmin) {
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
        email: ADMIN_EMAIL
      },
      process.env.JWT_ADMIN_SECRET || ADMIN_SECRET,
      { expiresIn: '1h' }
    );
    
    // Set HTTP-only cookie for admin
    setTokenCookie(res, token, true);

    console.log('Admin login successful');
    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        admin: {
          email: 'admin@agency.com',
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

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Password reset requested for:', email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();
    console.log('Reset token generated for user:', { id: user._id });

    try {
      await sendPasswordResetEmail(email, resetToken);
      res.json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'Error sending reset email'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    console.log('Password reset successful for user:', { id: user._id });

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  adminLogin,
  getCurrentUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  generateToken
};
