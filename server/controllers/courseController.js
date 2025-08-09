const Course = require('../models/Course');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getAllCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 9,
      search,
      country,
      level,
      field,
      city,
      featured,
      currency,
      duration, // substring match e.g., '2 years'
      minFee,
      maxFee,
      minRating,
      sort = 'newest'
    } = req.query;

    const numericLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 9));
    const numericPage = Math.max(1, parseInt(page, 10) || 1);

    const query = { isActive: true };

    // Text search across indexed fields
    if (search) {
      query.$text = { $search: search };
    }

    if (country) query.country = { $regex: country, $options: 'i' };
    if (city) query.city = { $regex: city, $options: 'i' };
    if (level) query.level = level;
    if (field) query.field = { $regex: field, $options: 'i' };
    if (currency) query.currency = currency;
    if (duration) query.duration = { $regex: duration, $options: 'i' };
    if (featured === 'true') query.featured = true;

    // Tuition fee range
    if (minFee || maxFee) {
      query.tuitionFee = {};
      if (minFee) query.tuitionFee.$gte = Number(minFee);
      if (maxFee) query.tuitionFee.$lte = Number(maxFee);
    }

    // Minimum rating
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Sorting
    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { tuitionFee: 1 },
      price_desc: { tuitionFee: -1 },
      rating_desc: { rating: -1 },
      rating_asc: { rating: 1 },
      title_asc: { title: 1 },
      title_desc: { title: -1 }
    };
    const sortOption = sortMap[sort] || sortMap.newest;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .limit(numericLimit)
        .skip((numericPage - 1) * numericLimit)
        .sort(sortOption),
      Course.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        courses,
        totalPages: Math.ceil(total / numericLimit),
        currentPage: numericPage,
        total
      }
    });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get featured courses
// @route   GET /api/courses/featured
// @access  Public
const getFeaturedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ 
      isActive: true, 
      featured: true 
    })
    .limit(5)
    .sort({ rating: -1 });

    res.json({
      success: true,
      data: {
        courses
      }
    });
  } catch (error) {
    console.error('Get featured courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('bookmarkedBy', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: {
        course
      }
    });
  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get courses by country
// @route   GET /api/courses/country/:country
// @access  Public
const getCoursesByCountry = async (req, res) => {
  try {
    const { country } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const courses = await Course.find({ 
      country: { $regex: country, $options: 'i' },
      isActive: true 
    })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

    const total = await Course.countDocuments({ 
      country: { $regex: country, $options: 'i' },
      isActive: true 
    });

    res.json({
      success: true,
      data: {
        courses,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
        country
      }
    });
  } catch (error) {
    console.error('Get courses by country error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Search courses
// @route   GET /api/courses/search
// @access  Public
const searchCourses = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const courses = await Course.find({
      $text: { $search: q },
      isActive: true
    })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ score: { $meta: 'textScore' } });

    const total = await Course.countDocuments({
      $text: { $search: q },
      isActive: true
    });

    res.json({
      success: true,
      data: {
        courses,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
        searchQuery: q
      }
    });
  } catch (error) {
    console.error('Search courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get course statistics
// @route   GET /api/courses/stats
// @access  Public
const getCourseStats = async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments({ isActive: true });
    const featuredCourses = await Course.countDocuments({ isActive: true, featured: true });
    
    const countries = await Course.distinct('country');
    const fields = await Course.distinct('field');
    const levels = await Course.distinct('level');

    res.json({
      success: true,
      data: {
        totalCourses,
        featuredCourses,
        totalCountries: countries.length,
        totalFields: fields.length,
        totalLevels: levels.length,
        countries,
        fields,
        levels
      }
    });
  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getAllCourses,
  getFeaturedCourses,
  getCourseById,
  getCoursesByCountry,
  searchCourses,
  getCourseStats
}; 