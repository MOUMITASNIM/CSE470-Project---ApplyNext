const express = require('express');
const { protectUser } = require('../middleware/auth');
const {
  getUserDashboard,
  bookmarkCourse,
  getBookmarkedCourses,
  getProfile,
  updateProfile,
  getBookmarkStatus,
  removeBookmark,
  deleteProfile
} = require('../controllers/userController');

const router = express.Router();

// All routes are protected
router.use(protectUser);

// Dashboard routes
router.get('/dashboard', getUserDashboard);
router.get('/bookmarks', getBookmarkedCourses);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/profile', deleteProfile);

// Course bookmarking routes
router.post('/bookmark/:courseId', bookmarkCourse);
router.get('/bookmark-status/:courseId', getBookmarkStatus);
router.delete('/bookmark/:courseId', removeBookmark);

module.exports = router; 