const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to get token from cookies or headers
const getTokenFromRequest = (req, isAdmin = false) => {
  // Check for specific token type first
  const cookieName = isAdmin ? 'adminToken' : 'token';
  if (req.cookies && req.cookies[cookieName]) {
    return req.cookies[cookieName];
  }
  
  // Fallback to Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }
  
  return null;
};

// Helper function to set HTTP-only cookie
const setTokenCookie = (res, token, isAdmin = false) => {
  const cookieName = isAdmin ? 'adminToken' : 'token';
  const maxAge = isAdmin ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 1 hour for admin, 24 hours for users
  
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge,
    path: '/'
  });
};

// Helper function to clear cookies
const clearTokenCookies = (res) => {
  res.clearCookie('token', { path: '/' });
  res.clearCookie('adminToken', { path: '/' });
};

// Middleware to protect user routes
const protectUser = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token with fallback secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Token is not valid.'
    });
  }
};

// Middleware to protect admin routes
const protectAdmin = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req, true); // Specifically look for admin token

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No admin token provided.'
      });
    }

    // Verify admin token with admin secret
    const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    
    // Verify it's an admin token
    if (!decoded.role || decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Add admin info to request
    req.admin = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
    
    // Check if token is for admin role
    if (!decoded.role || decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    // Get admin user from token
    const admin = await User.findById(decoded.id).select('-password');
    
    if (!admin || admin.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Admin access required.'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is deactivated.'
      });
    }

    req.admin = admin;
    req.user = admin; // Also set req.user for consistency
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Admin token is not valid.'
    });
  }
};

// Optional auth middleware (for routes that can work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (token) {
      // Try user token first
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (userError) {
        // Try admin token
        try {
          const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
          const admin = await User.findById(decoded.id).select('-password');
          if (admin && admin.role === 'admin' && admin.isActive) {
            req.admin = admin;
          }
        } catch (adminError) {
          // Both tokens failed, but we don't block the request
          console.error('Optional auth error:', adminError);
        }
      }
    }

    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

module.exports = {
  protectUser,
  protectAdmin,
  optionalAuth,
  setTokenCookie,
  clearTokenCookies,
  getTokenFromRequest
}; 