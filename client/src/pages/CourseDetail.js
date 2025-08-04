import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, 
  Star, 
  Clock, 
  Heart, 
  Calendar, 
  GraduationCap,
  DollarSign,
  Users,
  CheckCircle,
  ArrowLeft,
  BookOpen
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CourseDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const response = await axios.get(`/api/courses/${id}`);
      setCourse(response.data.data.course);
      
      if (isAuthenticated) {
        const bookmarkResponse = await axios.get(`/api/user/bookmark-status/${id}`);
        setIsBookmarked(bookmarkResponse.data.data.bookmarked);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to bookmark courses');
      return;
    }

    try {
      const response = await axios.post(`/api/user/bookmark/${id}`);
      setIsBookmarked(response.data.bookmarked);
      toast.success(response.data.bookmarked ? 'Course bookmarked successfully' : 'Course removed from bookmarks');
    } catch (error) {
      console.error('Error bookmarking course:', error);
      toast.error('Failed to bookmark course');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
          <Link to="/courses" className="btn-primary">
            Browse All Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/courses"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="card p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-3 py-1 bg-primary-100 text-primary-600 text-sm font-medium rounded-full">
                      {course.level}
                    </span>
                    <span className="px-3 py-1 bg-secondary-100 text-secondary-600 text-sm font-medium rounded-full">
                      {course.field}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                  <p className="text-gray-600 text-lg">{course.description}</p>
                </div>
                <button
                  onClick={handleBookmark}
                  className={`p-3 rounded-full transition-colors duration-200 ${
                    isBookmarked
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  <Heart className={`h-6 w-6 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="text-sm">{course.university}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <span className="text-sm">{course.duration}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  <span className="text-sm">{course.rating} ({course.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-5 w-5 mr-2" />
                  <span className="text-sm">{course.currency} {course.tuitionFee?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Course Image */}
            <div className="card overflow-hidden mb-6">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>

            {/* Course Details */}
            <div className="card p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                  <p className="text-gray-600">{course.city}, {course.country}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Start Date</h3>
                  <p className="text-gray-600">
                    {course.startDate ? formatDate(course.startDate) : 'TBD'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Application Deadline</h3>
                  <p className="text-gray-600">
                    {course.applicationDeadline ? formatDate(course.applicationDeadline) : 'TBD'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Tuition Fee</h3>
                  <p className="text-gray-600">
                    {course.currency} {course.tuitionFee?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <div className="card p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {course.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Highlights */}
            {course.highlights && course.highlights.length > 0 && (
              <div className="card p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Program Highlights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Apply Card */}
            <div className="card p-6 mb-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Apply Now</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">
                    {course.currency} {course.tuitionFee?.toLocaleString()}
                  </div>
                  <p className="text-gray-600 text-sm">Tuition Fee</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-medium">{course.level}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{course.city}, {course.country}</span>
                  </div>
                </div>

                <button className="btn-primary w-full">
                  Apply for this Course
                </button>
                
                <button
                  onClick={handleBookmark}
                  className={`w-full py-3 px-4 rounded-lg border-2 font-medium transition-colors duration-200 ${
                    isBookmarked
                      ? 'border-red-500 text-red-600 hover:bg-red-50'
                      : 'border-primary-600 text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  {isBookmarked ? 'Remove from Bookmarks' : 'Add to Bookmarks'}
                </button>
              </div>
            </div>

            {/* University Info */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">About {course.university}</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">{course.city}, {course.country}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="text-sm">Leading University</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  <span className="text-sm">Top-ranked institution</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail; 