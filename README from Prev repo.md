# 🌍 Global Education Platform

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for discovering and managing global education opportunities. Built with modern web technologies and inspired by leading education platforms like IDP.

## ✨ Features

### 🎯 Core Functionality
- **User Authentication**: Secure JWT-based authentication for users and admins
- **Password Recovery**: Email-based password reset with secure tokens
- **Course Discovery**: Browse and search courses from leading universities worldwide
- **Course Bookmarking**: Save favorite courses for later reference
- **User Profile Management**: Edit profile, upload picture, manage bookmarks
- **Responsive Design**: Modern, mobile-friendly interface with Tailwind CSS
- **Real-time Search**: Advanced filtering by country, level, and field of study

### 🏠 Pages & Components
- **Home Page**: Hero section, featured courses, and platform statistics
- **User Dashboard**: Personal dashboard with bookmarked courses and activity
- **User Profile**: Edit profile, upload picture, manage bookmarks, delete account
- **Admin Dashboard**: Administrative panel with sidebar navigation and statistics
- **Course Listing**: Searchable course catalog with filters
- **Course Details**: Comprehensive course information and application
- **Authentication**: Login, registration, admin login, and password recovery pages

### 🔐 Security Features
- **JWT token-based authentication** with HTTP-only cookies
- **Password hashing** with bcrypt (12 salt rounds)
- **Secure password reset** with time-limited tokens (15 minutes)
- **Rate limiting** on authentication routes
- **Protected routes and middleware** with role-based access
- **Separate admin authentication system**
- **Email verification** for password recovery
- **Input validation and sanitization** against XSS and NoSQL injection
- **CORS protection** with whitelisted domains
- **Security headers** (Helmet, CSP, XSS protection)
- **Error handling** without information leakage
- **MongoDB injection protection** with sanitization

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens with HTTP-only cookies
- **bcryptjs** - Password hashing (12 salt rounds)
- **nodemailer** - Email functionality for password reset
- **express-validator** - Input validation
- **express-rate-limit** - Rate limiting
- **express-mongo-sanitize** - NoSQL injection protection
- **xss-clean** - XSS protection
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **cookie-parser** - HTTP-only cookie handling

### Frontend
- **React** - UI library
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library

## 📁 Project Structure

```
global-education-platform/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   └── index.js        # App entry point
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── scripts/            # Database seeding
│   ├── index.js            # Server entry point
│   └── package.json
├── package.json            # Root package.json
├── env.example             # Environment variables template
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd global-education-platform
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit .env file with your configuration
MONGODB_URI="your url"
JWT_SECRET=your_key
JWT_ADMIN_SECRET=your_key_here
PORT=5000
NODE_ENV=development
```

### 4. Database Setup
```bash
# Navigate to server directory
cd server

# Seed the database with sample data
node scripts/seedData.js
```

### 5. Start the Application
```bash
# From the root directory
npm run dev

# Or start server and client separately
npm run server    # Starts backend on port 5000
npm run client    # Starts frontend on port 3000
```

## 🔑 Default Credentials

### Admin Access
- **Email**: admin@globaleducation.com
- **Password**: admin123456
- **URL**: http://localhost:3000/admin-login

### User Registration
- Create a new account at http://localhost:3000/register
- Or use the login page at http://localhost:3000/login

## 📊 Sample Data

The application comes pre-loaded with 5 sample courses:
1. Master of Computer Science - University of Toronto
2. Bachelor of Business Administration - University of Melbourne
3. PhD in Engineering - Imperial College London
4. Master of Arts in International Relations - Sciences Po Paris
5. Bachelor of Medicine and Surgery - University of Edinburgh

## 🎨 Design Features

### Color Palette
- **Primary**: Blue tones (#3b82f6, #2563eb)
- **Secondary**: Purple tones (#d946ef, #c026d3)
- **Accent**: Red tones (#ef4444, #dc2626)
- **Success**: Green tones (#22c55e, #16a34a)

### UI Components
- Modern card-based layouts
- Gradient backgrounds
- Smooth hover animations
- Responsive grid systems
- Custom form components

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/featured` - Get featured courses
- `GET /api/courses/:id` - Get course by ID
- `GET /api/courses/search` - Search courses

### User Dashboard
- `GET /api/user/dashboard` - Get user dashboard
- `GET /api/user/bookmarks` - Get bookmarked courses
- `POST /api/user/bookmark/:courseId` - Toggle bookmark
- `PUT /api/user/profile` - Update profile

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- [ ] Advanced course filtering
- [ ] User reviews and ratings
- [ ] Application tracking system
- [ ] Scholarship integration
- [ ] Multi-language support
- [ ] Mobile app development
- [ ] Payment integration
- [ ] Email notifications
- [ ] Advanced analytics dashboard

---

**Built with ❤️ for global education opportunities** 