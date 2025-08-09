const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const testAuth = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/applynext');
    console.log('✅ Connected to MongoDB');

    // Check if admin user exists
    const admin = await User.findOne({ email: 'admin@agency.com' });
    if (admin) {
      console.log('✅ Admin user found:', admin.email);
      console.log('Role:', admin.role);
      console.log('Is Active:', admin.isActive);
      
      // Test password comparison
      const isMatch = await admin.comparePassword('admin123');
      console.log('Password match:', isMatch);
    } else {
      console.log('❌ Admin user not found');
      
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const newAdmin = await User.create({
        name: "Admin User",
        email: "admin@agency.com",
        password: hashedPassword,
        role: "admin"
      });
      console.log('✅ Created admin user:', newAdmin.email);
    }

    // Test user creation
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword,
        role: "user"
      });
      console.log('✅ Created test user:', user.email);
    } else {
      console.log('✅ Test user exists:', testUser.email);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
};

testAuth(); 