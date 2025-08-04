import React, { useState, useEffect } from 'react';
import { Users, BookOpen, BarChart3, Settings, Activity, Award, FileText, TrendingUp } from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../components/layouts/AdminLayout';
import ManageUsers from '../components/admin/ManageUsers';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalBookmarks: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const sidebarItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: BarChart3,
      onClick: () => setActiveTab('dashboard')
    },
    {
      id: 'users',
      title: 'Manage Users',
      icon: Users,
      onClick: () => setActiveTab('users')
    },
    {
      id: 'courses',
      title: 'Manage Courses',
      icon: BookOpen,
      onClick: () => setActiveTab('courses')
    },
    {
      id: 'scholarships',
      title: 'Manage Scholarships',
      icon: Award,
      onClick: () => setActiveTab('scholarships')
    },
    {
      id: 'applications',
      title: 'View Applications',
      icon: FileText,
      onClick: () => setActiveTab('applications')
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      onClick: () => setActiveTab('settings')
    }
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/admin/stats', {
          withCredentials: true
        });
        console.log('Stats response:', response.data);
        if (response.data.success) {
          setStats(response.data.data);
        } else {
          console.error('Stats API returned success: false', response.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error.response?.data || error.message);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const getCardColor = (index) => {
    const colors = ['#3b7e9b', '#5cb2af', '#7dd8c3', '#f76e6e'];
    return colors[index % colors.length];
  };

  const renderStatsCard = (title, value, icon, trend, index) => {
    return React.createElement('div', { 
      className: 'rounded-lg shadow-lg p-6 transform transition-all duration-200 hover:scale-105',
      style: { backgroundColor: getCardColor(index) }
    },
      React.createElement('div', { className: 'flex items-center' },
        React.createElement('div', { className: 'p-3 rounded-lg bg-white/20' },
          React.createElement(icon, { className: 'h-6 w-6 text-white' })
        ),
        React.createElement('div', { className: 'ml-4' },
          React.createElement('p', { className: 'text-sm font-medium text-white/90' }, title),
          React.createElement('p', { className: 'text-2xl font-bold text-white' }, 
            typeof value === 'number' ? value.toLocaleString() : value
          )
        )
      ),
      trend && React.createElement('div', { className: 'mt-4 flex items-center text-sm text-white/90' },
        React.createElement(TrendingUp, { className: 'h-4 w-4 mr-1' }),
        React.createElement('span', null, trend)
      )
    );
  };

  const renderDashboardContent = () => {
    return React.createElement(React.Fragment, null,
      // Header Section
      React.createElement('div', { className: 'mb-8' },
        React.createElement('h1', { className: 'text-3xl font-bold text-[#3b7e9b]' }, 'Dashboard Overview'),
        React.createElement('p', { className: 'mt-2 text-[#5cb2af]' }, 'Welcome to your admin dashboard')
      ),

      // Main Stats Grid
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8' },
        renderStatsCard('Total Users', stats.totalUsers, Users, `${stats.newUsersThisMonth} new this month`, 0),
        renderStatsCard('Total Courses', stats.totalCourses, BookOpen, 'Available courses', 1),
        renderStatsCard('Total Bookmarks', stats.totalBookmarks, Activity, 'Course bookmarks', 2),
        renderStatsCard('Active Users', stats.activeUsers, Users, 'Currently active', 3)
      ),
      
      // User Registration Stats
      React.createElement('div', { className: 'mb-8' },
        React.createElement('h2', { className: 'text-2xl font-bold text-[#3b7e9b] mb-4' }, 'User Registration Statistics'),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
          renderStatsCard('New Users Today', stats.newUsersToday, Users, 'Registered today', 0),
          renderStatsCard('New Users This Week', stats.newUsersThisWeek, Users, 'Registered this week', 1),
          renderStatsCard('New Users This Month', stats.newUsersThisMonth, Users, 'Registered this month', 2)
        )
      ),
      
      // Application Stats
      React.createElement('div', { className: 'mb-8' },
        React.createElement('h2', { className: 'text-2xl font-bold text-[#3b7e9b] mb-4' }, 'Application Statistics'),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
          renderStatsCard('Total Applications', stats.totalApplications, FileText, 'All applications', 0),
          renderStatsCard('Pending Applications', stats.pendingApplications, Activity, 'Awaiting review', 1),
          renderStatsCard('Approved Applications', stats.approvedApplications, Award, 'Successfully approved', 2)
        )
      )
    );
  };

  const renderComingSoon = (title) => {
    return React.createElement('div', { className: 'bg-white rounded-lg shadow-lg p-8 text-center' },
      React.createElement('div', { className: 'mb-4' },
        React.createElement('div', { className: 'inline-flex items-center justify-center w-16 h-16 bg-[#3b7e9b] text-white rounded-full mb-4' },
          React.createElement(Settings, { className: 'h-8 w-8' })
        )
      ),
      React.createElement('h2', { className: 'text-2xl font-bold mb-4 text-[#3b7e9b]' }, title),
      React.createElement('p', { className: 'text-gray-600 text-lg' }, 'Coming Soon'),
      React.createElement('p', { className: 'text-gray-500 mt-2' }, 'This feature is currently under development and will be available soon.')
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardContent();
      case 'users':
        return React.createElement(ManageUsers);
      case 'courses':
        return renderComingSoon('Course Management');
      case 'scholarships':
        return renderComingSoon('Scholarship Management');
      case 'applications':
        return renderComingSoon('Application Management');
      case 'settings':
        return renderComingSoon('Settings');
      default:
        return renderDashboardContent();
    }
  };

  return React.createElement(AdminLayout, {
    sidebarItems: sidebarItems,
    activePage: activeTab,
    children: renderContent()
  });
};

export default AdminDashboard;
