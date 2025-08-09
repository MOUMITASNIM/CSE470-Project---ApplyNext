const User = require('../models/User');
const Course = require('../models/Course');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    console.log('Fetching admin stats...');
    // Get total users
    const totalUsers = await User.countDocuments();
    console.log('Total users:', totalUsers);
    
    // Get total courses
    const totalCourses = await Course.countDocuments();
    
    // Get total bookmarks
    const totalBookmarks = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $size: "$bookmarkedCourses" } }
        }
      }
    ]);
    
    // Get active users in last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: twentyFourHoursAgo }
    });

    // Get new users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today }
    });

    // Get new users this week
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: weekAgo }
    });

    // Get new users this month
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: monthAgo }
    });

    // Application stats (placeholder - you can implement based on your application model)
    const totalApplications = 0; // Replace with actual application count
    const pendingApplications = 0; // Replace with actual pending count
    const approvedApplications = 0; // Replace with actual approved count

    const statsData = {
      totalUsers,
      totalCourses,
      totalBookmarks: totalBookmarks[0]?.total || 0,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      totalApplications,
      pendingApplications,
      approvedApplications
    };
    
    console.log('Stats data:', statsData);
    
    res.json({
      success: true,
      data: statsData
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Clean up references (e.g., bookmarks)
    await Course.updateMany(
      { bookmarkedBy: user._id },
      { $pull: { bookmarkedBy: user._id } }
    );

    // Delete the user using a supported method in Mongoose 7+
    await User.deleteOne({ _id: user._id });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { name, email, phone, university, nationality, role, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (university !== undefined) user.university = university;
    if (nationality !== undefined) user.nationality = nationality;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    const updatedUser = await user.save();
    
    // Remove password from response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      data: userResponse,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
};

// @desc    Get all courses
// @route   GET /api/admin/courses
// @access  Private/Admin
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses'
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/admin/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Delete the course using a supported method in Mongoose 7+
    await Course.deleteOne({ _id: course._id });

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course'
    });
  }
};

module.exports = {
  getStats,
  getUsers,
  updateUser,
  deleteUser,
  getCourses,
  deleteCourse
};
