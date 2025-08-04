import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Clock, 
  Heart,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Courses = () => {
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    country: '',
    level: '',
    field: ''
  });
  const [bookmarkedCourses, setBookmarkedCourses] = useState(new Set());

  useEffect(() => {
    fetchCourses();
    if (isAuthenticated) {
      fetchBookmarkedCourses();
    }
  }, [isAuthenticated]);

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.country) params.append('country', filters.country);
      if (filters.level) params.append('level', filters.level);
      if (filters.field) params.append('field', filters.field);

      const response = await axios.get(`/api/courses?${params.toString()}`);
      setCourses(response.data.data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarkedCourses = async () => {
    try {
      const response = await axios.get('/api/user/bookmarks');
      const bookmarkedIds = new Set(response.data.data.bookmarkedCourses.map(course => course._id));
      setBookmarkedCourses(bookmarkedIds);
    } catch (error) {
      console.error('Error fetching bookmarked courses:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleBookmark = async (courseId) => {
    if (!isAuthenticated) {
      toast.error('Please login to bookmark courses');
      return;
    }

    try {
      const response = await axios.post(`/api/user/bookmark/${courseId}`);
      if (response.data.bookmarked) {
        setBookmarkedCourses(prev => new Set([...prev, courseId]));
        toast.success('Course bookmarked successfully');
      } else {
        setBookmarkedCourses(prev => {
          const newSet = new Set(prev);
          newSet.delete(courseId);
          return newSet;
        });
        toast.success('Course removed from bookmarks');
      }
    } catch (error) {
      console.error('Error bookmarking course:', error);
      toast.error('Failed to bookmark course');
    }
  };

  const countries = ['Canada', 'Australia', 'United Kingdom', 'France', 'United States'];
  const levels = ['Undergraduate', 'Graduate', 'PhD', 'Diploma', 'Certificate'];
  const fields = ['Computer Science', 'Business Administration', 'Engineering', 'Medicine', 'International Relations'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Courses</h1>
          <p className="text-gray-600">Discover world-class education opportunities from leading universities</p>
        </div>

        {/* Search and Filters - Commented out for now */}
        {/*
        <div className="card p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses, universities, or fields of study..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Levels</option>
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Field</label>
                <select
                  value={filters.field}
                  onChange={(e) => handleFilterChange('field', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Fields</option>
                  {fields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="submit"
                className="btn-primary flex items-center"
              >
                <Search className="h-4 w-4 mr-2" />
                Search Courses
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ country: '', level: '', field: '' });
                  fetchCourses();
                }}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Clear Filters
              </button>
            </div>
          </form>
        </div>
        */}

        {/* Results */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {courses.length} Course{courses.length !== 1 ? 's' : ''} Found
          </h2>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({ country: '', level: '', field: '' });
                fetchCourses();
              }}
              className="btn-primary"
            >
              View All Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="card overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium text-gray-700">
                    {course.currency} {course.tuitionFee?.toLocaleString()}
                  </div>
                  <button
                    onClick={() => handleBookmark(course._id)}
                    className={`absolute top-4 left-4 p-2 rounded-full transition-colors duration-200 ${
                      bookmarkedCourses.has(course._id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${bookmarkedCourses.has(course._id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                      {course.level}
                    </span>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">{course.rating}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {course.university}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {course.duration}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 bg-secondary-100 text-secondary-600 text-xs font-medium rounded">
                        {course.field}
                      </span>
                    </div>
                    <Link
                      to={`/courses/${course._id}`}
                      className="btn-primary text-sm"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses; 