const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const {
  getAllCourses,
  getFeaturedCourses,
  getCourseById,
  getCoursesByCountry,
  searchCourses,
  getCourseStats
} = require('../controllers/courseController');

const router = express.Router();

// Public routes (optional auth for bookmark status)
router.use(optionalAuth);

// Course routes
router.get('/', getAllCourses);
router.get('/featured', getFeaturedCourses);
router.get('/stats', getCourseStats);
router.get('/search', searchCourses);
router.get('/country/:country', getCoursesByCountry);
router.get('/:id', getCourseById);

module.exports = router; 