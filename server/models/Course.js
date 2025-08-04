const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  university: {
    type: String,
    required: [true, 'University name is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  level: {
    type: String,
    enum: ['Undergraduate', 'Graduate', 'PhD', 'Diploma', 'Certificate'],
    required: [true, 'Study level is required']
  },
  field: {
    type: String,
    required: [true, 'Field of study is required'],
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true
  },
  tuitionFee: {
    type: Number,
    required: [true, 'Tuition fee is required']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  image: {
    type: String,
    required: [true, 'Course image is required']
  },
  universityLogo: {
    type: String,
    default: ''
  },
  requirements: [{
    type: String
  }],
  highlights: [{
    type: String
  }],
  applicationDeadline: {
    type: Date
  },
  startDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  bookmarkedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for search functionality
courseSchema.index({ 
  title: 'text', 
  description: 'text', 
  university: 'text', 
  field: 'text' 
});

module.exports = mongoose.model('Course', courseSchema); 