const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Course = require('../models/Course');

// Sample courses data
const sampleCourses = [
  {
    title: "Master of Computer Science",
    description: "Advanced program in computer science with focus on artificial intelligence and machine learning. Gain expertise in cutting-edge technologies and research methodologies.",
    university: "University of Toronto",
    country: "Canada",
    city: "Toronto",
    level: "Graduate",
    field: "Computer Science",
    duration: "2 years",
    tuitionFee: 45000,
    currency: "CAD",
    image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
    universityLogo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    requirements: [
      "Bachelor's degree in Computer Science or related field",
      "GPA 3.0 or higher",
      "GRE scores",
      "Letters of recommendation"
    ],
    highlights: [
      "World-class faculty",
      "Research opportunities",
      "Industry partnerships",
      "Career support services"
    ],
    applicationDeadline: new Date('2024-12-15'),
    startDate: new Date('2024-09-01'),
    featured: true,
    rating: 4.8,
    totalReviews: 156
  },
  {
    title: "Bachelor of Business Administration",
    description: "Comprehensive business program covering management, marketing, finance, and entrepreneurship. Develop leadership skills for global business success.",
    university: "University of Melbourne",
    country: "Australia",
    city: "Melbourne",
    level: "Undergraduate",
    field: "Business Administration",
    duration: "3 years",
    tuitionFee: 38000,
    currency: "AUD",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2011&q=80",
    universityLogo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    requirements: [
      "High school diploma",
      "English proficiency",
      "Mathematics background",
      "Personal statement"
    ],
    highlights: [
      "Internship opportunities",
      "Global exchange programs",
      "Professional networking",
      "Modern campus facilities"
    ],
    applicationDeadline: new Date('2024-11-30'),
    startDate: new Date('2024-02-01'),
    featured: true,
    rating: 4.6,
    totalReviews: 203
  },
  {
    title: "PhD in Engineering",
    description: "Research-intensive doctoral program in engineering with specialization in renewable energy and sustainable technologies.",
    university: "Imperial College London",
    country: "United Kingdom",
    city: "London",
    level: "PhD",
    field: "Engineering",
    duration: "4 years",
    tuitionFee: 28000,
    currency: "GBP",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    universityLogo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    requirements: [
      "Master's degree in Engineering",
      "Research proposal",
      "Academic references",
      "English proficiency"
    ],
    highlights: [
      "Leading research facilities",
      "Industry collaborations",
      "Publication opportunities",
      "International conferences"
    ],
    applicationDeadline: new Date('2024-10-31'),
    startDate: new Date('2024-01-15'),
    featured: true,
    rating: 4.9,
    totalReviews: 89
  },
  {
    title: "Master of Arts in International Relations",
    description: "Advanced study of global politics, diplomacy, and international cooperation. Prepare for careers in government, NGOs, and international organizations.",
    university: "Sciences Po Paris",
    country: "France",
    city: "Paris",
    level: "Graduate",
    field: "International Relations",
    duration: "2 years",
    tuitionFee: 15000,
    currency: "EUR",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2025&q=80",
    universityLogo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    requirements: [
      "Bachelor's degree in Political Science or related field",
      "French language proficiency",
      "Motivation letter",
      "Academic transcripts"
    ],
    highlights: [
      "Multilingual environment",
      "Diplomatic internships",
      "UN partnerships",
      "Cultural immersion"
    ],
    applicationDeadline: new Date('2024-12-01'),
    startDate: new Date('2024-09-01'),
    featured: false,
    rating: 4.7,
    totalReviews: 134
  },
  {
    title: "Bachelor of Medicine and Surgery",
    description: "Comprehensive medical program preparing students for careers in healthcare. Includes clinical rotations and hands-on patient care experience.",
    university: "University of Edinburgh",
    country: "United Kingdom",
    city: "Edinburgh",
    level: "Undergraduate",
    field: "Medicine",
    duration: "6 years",
    tuitionFee: 35000,
    currency: "GBP",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    universityLogo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    requirements: [
      "High school diploma with Biology and Chemistry",
      "UCAT exam",
      "Personal statement",
      "Interview process"
    ],
    highlights: [
      "State-of-the-art facilities",
      "Clinical placements",
      "Research opportunities",
      "Professional development"
    ],
    applicationDeadline: new Date('2024-10-15'),
    startDate: new Date('2024-09-01'),
    featured: true,
    rating: 4.8,
    totalReviews: 178
  }
];

// Admin user data
const adminUser = {
  name: "Admin User",
  email: "admin@agency.com",
  password: "admin123",
  role: "admin"
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/applynext');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminUser.password, 12);
    const admin = await User.create({
      ...adminUser,
      password: hashedPassword
    });
    console.log('👤 Admin user created:', admin.email);

    // Create sample courses
    const courses = await Course.create(sampleCourses);
    console.log(`📚 Created ${courses.length} sample courses`);

    console.log('🌱 Database seeded successfully!');
    console.log('\n📋 Sample Data:');
    console.log('Admin Login: admin@agency.com / admin123');
    console.log(`Courses: ${courses.length} courses created`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase(); 