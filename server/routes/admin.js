const express = require('express');
const verifyAdmin = require('../middleware/verifyAdmin');
const {
  getStats,
  getUsers,
  updateUser,
  deleteUser,
  getCourses,
  deleteCourse
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes are protected
router.use(verifyAdmin);

// Admin dashboard routes
router.get('/stats', getStats);

// User management routes
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Course management routes
router.get('/courses', getCourses);
router.delete('/courses/:id', deleteCourse);

module.exports = router; 