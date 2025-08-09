const User = require('../models/User');
const Course = require('../models/Course');
const { clearTokenCookies } = require('../middleware/auth');

// @desc    Get user dashboard
// @route   GET /api/user/dashboard
// @access  Private
const getUserDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('bookmarkedCourses')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user,
        dashboardStats: {
          totalBookmarks: user.bookmarkedCourses.length,
          memberSince: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Get user dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Bookmark a course
// @route   POST /api/user/bookmark/:courseId
// @access  Private
const bookmarkCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course is already bookmarked
    const user = await User.findById(userId);
    const isBookmarked = user.bookmarkedCourses.includes(courseId);

    if (isBookmarked) {
      // Remove bookmark
      await User.findByIdAndUpdate(userId, {
        $pull: { bookmarkedCourses: courseId }
      });

      await Course.findByIdAndUpdate(courseId, {
        $pull: { bookmarkedBy: userId }
      });

      res.json({
        success: true,
        message: 'Course removed from bookmarks',
        bookmarked: false
      });
    } else {
      // Add bookmark
      await User.findByIdAndUpdate(userId, {
        $addToSet: { bookmarkedCourses: courseId }
      });

      await Course.findByIdAndUpdate(courseId, {
        $addToSet: { bookmarkedBy: userId }
      });

      res.json({
        success: true,
        message: 'Course bookmarked successfully',
        bookmarked: true
      });
    }
  } catch (error) {
    console.error('Bookmark course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's bookmarked courses
// @route   GET /api/user/bookmarks
// @access  Private
const getBookmarkedCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'bookmarkedCourses',
        select: 'title description university country city level field duration tuitionFee currency image'
      })
      .select('bookmarkedCourses');

    res.json({
      success: true,
      data: {
        bookmarkedCourses: user.bookmarkedCourses || []
      }
    });
  } catch (error) {
    console.error('Get bookmarked courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Map profileImage to profilePicture for frontend compatibility
    const userData = user.toObject();
    userData.profilePicture = userData.profileImage;
    
    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, nationality, university, profilePicture } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (nationality) updateData.nationality = nationality;
    if (university) updateData.university = university;
    if (profilePicture) updateData.profileImage = profilePicture;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Map profileImage to profilePicture for frontend compatibility
    const userData = user.toObject();
    userData.profilePicture = userData.profileImage;

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Check if course is bookmarked
// @route   GET /api/user/bookmark-status/:courseId
// @access  Private
const getBookmarkStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const isBookmarked = user.bookmarkedCourses.includes(courseId);

    res.json({
      success: true,
      data: {
        bookmarked: isBookmarked
      }
    });
  } catch (error) {
    console.error('Get bookmark status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Remove bookmark for current user
// @route   DELETE /api/user/bookmark/:courseId
// @access  Private
const removeBookmark = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { bookmarkedCourses: courseId }
    });

    await Course.findByIdAndUpdate(courseId, {
      $pull: { bookmarkedBy: userId }
    });

    res.json({
      success: true,
      message: 'Course removed from bookmarks'
    });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete current user's account
// @route   DELETE /api/user/profile
// @access  Private
const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Clean up references where this user is referenced
    await Course.updateMany(
      { bookmarkedBy: user._id },
      { $pull: { bookmarkedBy: user._id } }
    );

    // Delete user document
    await User.deleteOne({ _id: user._id });

    // Clear auth cookies
    clearTokenCookies(res);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getUserDashboard,
  bookmarkCourse,
  getBookmarkedCourses,
  getProfile,
  updateProfile,
  getBookmarkStatus,
  removeBookmark,
  deleteProfile
};