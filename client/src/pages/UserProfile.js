import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  MapPin, 
  Camera, 
  Edit3, 
  Save, 
  X, 
  Trash2, 
  Bookmark,
  BookmarkX,
  Calendar,
  Shield,
  AlertTriangle,
  Phone,
  GraduationCap,
  Activity,
  Clock
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user, logout, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    nationality: '',
    university: '',
    profilePicture: null
  });
  const [bookmarkedCourses, setBookmarkedCourses] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalBookmarks: 0,
    lastLogin: null,
    memberSince: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState({});
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    loadProfile();
    loadDashboardData();
    
    // Socket connection disabled to prevent non-stop polling
    // Only load data once on component mount
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  const loadProfile = async () => {
    try {
      const response = await axios.get('/api/user/profile');
      if (response.data.success) {
        const userData = response.data.data;
        setProfile({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          nationality: userData.nationality || '',
          university: userData.university || '',
          profilePicture: userData.profilePicture || null
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile data');
    }
  };

  const loadDashboardData = async () => {
    try {
      const [dashboardResponse, bookmarksResponse] = await Promise.all([
        axios.get('/api/user/dashboard'),
        axios.get('/api/user/bookmarks')
      ]);

      if (dashboardResponse.data.success) {
        setDashboardStats(dashboardResponse.data.data);
        setRecentActivities(dashboardResponse.data.data.recentActivities || []);
      }

      if (bookmarksResponse.data.success) {
        setBookmarkedCourses(bookmarksResponse.data.data);
        setBookmarks(bookmarksResponse.data.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Image compression function
  const compressImage = (file, maxWidth = 400, quality = 0.7) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = (width * maxWidth) / height;
            height = maxWidth;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB for original file)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      try {
        toast.loading('Compressing image...');
        
        // Compress the image
        const compressedImage = await compressImage(file, 400, 0.7);
        
        // Check compressed size (should be much smaller)
        const compressedSize = Math.round((compressedImage.length * 3) / 4); // Approximate size
        if (compressedSize > 500 * 1024) { // 500KB limit for compressed
          toast.error('Image too large even after compression. Please use a smaller image.');
          return;
        }
        
        setProfile(prev => ({
          ...prev,
          profilePicture: compressedImage
        }));
        
        toast.dismiss();
        toast.success('Image uploaded and compressed successfully!');
      } catch (error) {
        toast.dismiss();
        toast.error('Error processing image');
        console.error('Image compression error:', error);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setErrors({});

    try {
      const response = await axios.put('/api/user/profile', profile);
      if (response.data.success) {
        const updatedUser = response.data.data;
        // Update local state and context
        setProfile(updatedUser);
        updateUser(updatedUser);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      
      if (error.response?.data?.errors) {
        const validationErrors = {};
        error.response.data.errors.forEach(err => {
          validationErrors[err.param] = err.msg;
        });
        setErrors(validationErrors);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    setDeleting(true);
    try {
      await axios.delete('/api/user/profile');
      toast.success('Account deleted successfully');
      logout();
    } catch (error) {
      toast.error('Failed to delete account');
      setDeleting(false);
    }
  };

  const removeProfilePicture = () => {
    setProfile(prev => ({
      ...prev,
      profilePicture: null
    }));
  };

  const removeBookmark = async (courseId) => {
    try {
      await axios.delete(`/api/user/bookmark/${courseId}`);
      setBookmarkedCourses(prev => prev.filter(course => course._id !== courseId));
      toast.success('Course removed from bookmarks');
    } catch (error) {
      toast.error('Failed to remove bookmark');
    }
  };

  if (loading) {
    return React.createElement('div', {
      className: 'min-h-screen flex items-center justify-center',
      style: { backgroundColor: 'rgb(0,0,139)' }
    }, React.createElement('div', {
      className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-white'
    }));
  }

  return React.createElement('div', {
    className: 'min-h-screen',
    style: { backgroundColor: 'rgb(0,0,139)', color: 'white' }
  }, [
    React.createElement('div', {
      key: 'main-content',
      className: 'py-8'
    }, React.createElement('div', {
      className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
    }, [
      // Header
      React.createElement('div', {
        key: 'header',
        className: 'text-center mb-8'
      }, [
        React.createElement('h1', {
          key: 'title',
          className: 'text-4xl font-bold text-white mb-2'
        }, 'User Profile Dashboard'),
        React.createElement('p', {
          key: 'subtitle',
          className: 'text-white opacity-80'
        }, 'Manage your account settings and track your activities')
      ]),
      
      // User Profile Card (Top) - Enhanced Horizontal Layout
      React.createElement('div', {
        key: 'profile-section',
        className: 'mb-8 flex justify-center'
      }, React.createElement('div', {
        className: 'w-full max-w-4xl'
      }, React.createElement('div', {
        className: 'rounded-lg p-8 shadow-lg',
        style: { backgroundColor: 'MediumSlateBlue' }
      }, React.createElement('div', {
        className: 'flex flex-col lg:flex-row items-center lg:items-start gap-8'
      }, [
        // Profile Picture Section
        React.createElement('div', {
          key: 'profile-pic-section',
          className: 'flex-shrink-0'
        }, React.createElement('div', {
          key: 'profile-pic',
          className: 'relative inline-block'
        }, [
          React.createElement('div', {
            key: 'photo-circle',
            className: 'rounded-full flex items-center justify-center text-white text-4xl font-bold overflow-hidden mx-auto',
            style: {
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '3px solid white'
            }
          }, profile.profilePicture ? 
            React.createElement('img', {
              src: profile.profilePicture,
              alt: 'Profile',
              style: {
                width: '120px',
                height: '120px',
                objectFit: 'cover',
                borderRadius: '50%'
              }
            }) :
            React.createElement(User, { className: 'h-16 w-16' })
          ),
          isEditing && React.createElement('label', {
            key: 'photo-upload',
            className: 'absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:shadow-xl transition-shadow'
          }, [
            React.createElement(Camera, {
              key: 'camera-icon',
              className: 'h-5 w-5 text-gray-600'
            }),
            React.createElement('input', {
              key: 'file-input',
              type: 'file',
              accept: 'image/*',
              onChange: handleFileChange,
              className: 'hidden'
            })
          ]),
          isEditing && profile.profilePicture && React.createElement('button', {
            key: 'remove-photo',
            onClick: removeProfilePicture,
            className: 'absolute top-0 right-0 bg-red-500 rounded-full p-1 shadow-lg cursor-pointer hover:bg-red-600 transition-colors',
            title: 'Remove photo'
          }, React.createElement(X, { className: 'h-4 w-4 text-white' }))
        ])),
        // Profile Info - Inline Editing (Enhanced Layout)
        React.createElement('div', {
          key: 'profile-info',
          className: 'flex-1 w-full'
        }, React.createElement('div', {
          key: 'info-grid',
          className: 'grid grid-cols-1 md:grid-cols-2 gap-6'
        }, [
          // Name Field
          React.createElement('div', { key: 'name-field' }, [
            React.createElement('label', {
              key: 'name-label',
              className: 'block text-sm font-medium text-white mb-1'
            }, 'Full Name'),
            isEditing ? 
              React.createElement('input', {
                key: 'name-input',
                type: 'text',
                name: 'name',
                value: profile.name,
                onChange: handleInputChange,
                className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black',
                placeholder: 'Enter your full name'
              }) :
              React.createElement('p', {
                key: 'name-display',
                className: 'text-lg font-semibold text-white'
              }, profile.name || 'Not given'),
            errors.name && React.createElement('p', {
              key: 'name-error',
              className: 'text-sm text-red-300 mt-1'
            }, errors.name)
          ]),
          // Email Field
          React.createElement('div', { key: 'email-field' }, [
            React.createElement('label', {
              key: 'email-label',
              className: 'block text-sm font-medium text-white mb-1'
            }, 'Email'),
            isEditing ? 
              React.createElement('input', {
                key: 'email-input',
                type: 'email',
                name: 'email',
                value: profile.email,
                onChange: handleInputChange,
                className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black',
                placeholder: 'Enter your email'
              }) :
              React.createElement('p', {
                key: 'email-display',
                className: 'text-white opacity-80 flex items-center justify-center'
              }, [
                React.createElement(Mail, {
                  key: 'mail-icon',
                  className: 'h-4 w-4 mr-2'
                }),
                profile.email || 'Not given'
              ]),
            errors.email && React.createElement('p', {
              key: 'email-error',
              className: 'text-sm text-red-300 mt-1'
            }, errors.email)
          ]),
          // Phone Field
          React.createElement('div', { key: 'phone-field' }, [
            React.createElement('label', {
              key: 'phone-label',
              className: 'block text-sm font-medium text-white mb-1'
            }, 'Phone Number'),
            isEditing ? 
              React.createElement('input', {
                key: 'phone-input',
                type: 'tel',
                name: 'phone',
                value: profile.phone,
                onChange: handleInputChange,
                className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black',
                placeholder: 'Enter your phone number'
              }) :
              React.createElement('p', {
                key: 'phone-display',
                className: 'text-white opacity-80 flex items-center justify-center'
              }, [
                React.createElement(Phone, {
                  key: 'phone-icon',
                  className: 'h-4 w-4 mr-2'
                }),
                profile.phone || 'Not given'
              ])
          ]),
          // University Field
          React.createElement('div', { key: 'university-field' }, [
            React.createElement('label', {
              key: 'university-label',
              className: 'block text-sm font-medium text-white mb-1'
            }, 'University'),
            isEditing ? 
              React.createElement('input', {
                key: 'university-input',
                type: 'text',
                name: 'university',
                value: profile.university,
                onChange: handleInputChange,
                className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black',
                placeholder: 'Enter your university name'
              }) :
              React.createElement('p', {
                key: 'university-display',
                className: 'text-white opacity-80 flex items-center justify-center'
              }, [
                React.createElement(GraduationCap, {
                  key: 'grad-icon',
                  className: 'h-4 w-4 mr-2'
                }),
                profile.university || 'Not given'
              ])
          ]),
          // Nationality Field
          React.createElement('div', { key: 'nationality-field' }, [
            React.createElement('label', {
              key: 'nationality-label',
              className: 'block text-sm font-medium text-white mb-1'
            }, 'Nationality'),
            isEditing ? 
              React.createElement('input', {
                key: 'nationality-input',
                type: 'text',
                name: 'nationality',
                value: profile.nationality,
                onChange: handleInputChange,
                className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black',
                placeholder: 'Enter your nationality'
              }) :
              React.createElement('p', {
                key: 'nationality-display',
                className: 'text-white opacity-80 flex items-center justify-center'
              }, [
                React.createElement(MapPin, {
                  key: 'map-icon',
                  className: 'h-4 w-4 mr-2'
                }),
                profile.nationality || 'Not given'
              ])
          ])
        ])),
        // Member Since & Action Buttons Section
        React.createElement('div', {
          key: 'actions-section',
          className: 'w-full lg:w-auto flex flex-col items-center lg:items-end gap-4'
        }, [
          // Member Since (always displayed)
          React.createElement('div', {
            key: 'member-since-card',
            className: 'bg-white bg-opacity-10 rounded-lg p-4 text-center'
          }, [
            React.createElement('p', {
              key: 'member-since-label',
              className: 'text-white opacity-60 text-sm mb-1'
            }, 'Member Since'),
            React.createElement('p', {
              key: 'member-since',
              className: 'text-white font-semibold flex items-center justify-center'
            }, [
              React.createElement(Calendar, {
                key: 'calendar-icon',
                className: 'h-4 w-4 mr-2'
              }),
              new Date(dashboardStats.memberSince || Date.now()).toLocaleDateString()
            ])
          ]),
          // Action Buttons
          React.createElement('div', {
            key: 'action-buttons',
            className: 'space-y-3 w-full lg:w-auto min-w-[200px]'
          }, [
            isEditing ? 
              React.createElement('div', {
                key: 'edit-buttons',
                className: 'flex space-x-2'
              }, [
                React.createElement('button', {
                  key: 'save-btn',
                  onClick: handleSave,
                  disabled: saving,
                  className: 'flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center'
                }, saving ? 'Saving...' : [
                  React.createElement(Save, {
                    key: 'save-icon',
                    className: 'h-4 w-4 mr-2'
                  }),
                  'Save'
                ]),
                React.createElement('button', {
                  key: 'cancel-btn',
                  onClick: () => setIsEditing(false),
                  className: 'flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center'
                }, [
                  React.createElement(X, {
                    key: 'cancel-icon',
                    className: 'h-4 w-4 mr-2'
                  }),
                  'Cancel'
                ])
              ]) :
              React.createElement('button', {
                key: 'edit-btn',
                onClick: () => setIsEditing(true),
                className: 'w-full px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center justify-center'
              }, [
                React.createElement(Edit3, {
                  key: 'edit-icon',
                  className: 'h-4 w-4 mr-2'
                }),
                'Edit Profile'
              ]),
            // Delete Account Button
            React.createElement('button', {
              key: 'delete-btn',
              onClick: () => setShowDeleteModal(true),
              className: 'w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center'
            }, [
              React.createElement(Trash2, {
                key: 'delete-icon',
                className: 'h-4 w-4 mr-2'
              }),
              'Delete Account'
            ])
          ])
        ])
      ])))),
      
      // Bottom Cards Grid - COMMENTED OUT
      /*
      React.createElement('div', {
        key: 'bottom-grid',
        className: 'grid grid-cols-1 lg:grid-cols-3 gap-6'
      }, [
        // Last Login Card (Compact)
        React.createElement('div', {
          key: 'last-login-card',
          className: 'lg:col-span-1'
        }, React.createElement('div', {
          className: 'rounded-lg p-4 shadow-lg',
          style: { backgroundColor: 'MediumSlateBlue' }
        }, [
          React.createElement('div', {
            key: 'last-login-header',
            className: 'flex items-center mb-3'
          }, [
            React.createElement(Clock, {
              key: 'clock-icon',
              className: 'h-5 w-5 text-white mr-2'
            }),
            React.createElement('h3', {
              key: 'last-login-title',
              className: 'text-lg font-bold text-white'
            }, 'Last Login')
          ]),
          React.createElement('p', {
            key: 'last-login-date',
            className: 'text-white opacity-80 text-sm'
          }, dashboardStats.lastLogin ? new Date(dashboardStats.lastLogin).toLocaleString() : 'Not available'),
          React.createElement('p', {
            key: 'last-login-desc',
            className: 'text-white opacity-60 text-xs mt-1'
          }, 'Your most recent activity')
        ])),

        // Bookmarks Card
        React.createElement('div', {
          key: 'bookmarks-card',
          className: 'lg:col-span-2'
        }, React.createElement('div', {
          className: 'rounded-lg p-6 shadow-lg',
          style: { backgroundColor: 'MediumSlateBlue' }
        }, [
          React.createElement('div', {
            key: 'bookmarks-header',
            className: 'flex items-center justify-between mb-6'
          }, [
            React.createElement('h3', {
              key: 'bookmarks-title',
              className: 'text-xl font-bold text-white flex items-center'
            }, [
              React.createElement(Bookmark, {
                key: 'bookmark-icon',
                className: 'h-6 w-6 mr-2'
              }),
              'My Bookmarks'
            ]),
            React.createElement('span', {
              key: 'bookmarks-count',
              className: 'bg-white text-purple-600 px-3 py-1 rounded-full text-sm font-medium'
            }, `${bookmarks.length} saved`)
          ]),
          React.createElement('div', {
            key: 'bookmarks-list',
            className: 'space-y-3 max-h-64 overflow-y-auto'
          }, bookmarks.length > 0 ? bookmarks.map((bookmark, index) =>
            React.createElement('div', {
              key: `bookmark-${index}`,
              className: 'bg-white bg-opacity-10 rounded-lg p-4 hover:bg-opacity-20 transition-colors'
            }, [
              React.createElement('h4', {
                key: 'bookmark-title',
                className: 'font-semibold text-white mb-2'
              }, bookmark.title),
              React.createElement('p', {
                key: 'bookmark-desc',
                className: 'text-white opacity-80 text-sm mb-2'
              }, bookmark.description),
              React.createElement('div', {
                key: 'bookmark-meta',
                className: 'flex items-center justify-between'
              }, [
                React.createElement('span', {
                  key: 'bookmark-course',
                  className: 'text-white opacity-70 text-sm'
                }, bookmark.course),
                React.createElement('span', {
                  key: 'bookmark-date',
                  className: 'text-white opacity-60 text-sm'
                }, new Date(bookmark.createdAt).toLocaleDateString())
              ])
            ])
          ) : [
            React.createElement('div', {
              key: 'no-bookmarks',
              className: 'text-center py-8'
            }, [
              React.createElement(BookmarkX, {
                key: 'no-bookmark-icon',
                className: 'h-12 w-12 text-white opacity-50 mx-auto mb-4'
              }),
              React.createElement('p', {
                key: 'no-bookmark-text',
                className: 'text-white opacity-70'
              }, 'No bookmarks yet. Start learning to save your progress!')
            ])
          ])
        ]))
      ])
      */
    ])),
    
    // Delete Confirmation Modal
    showDeleteModal && React.createElement('div', {
      key: 'delete-modal',
      className: 'fixed inset-0 z-50 flex items-center justify-center p-4'
    }, [
      React.createElement('div', {
        key: 'backdrop',
        className: 'fixed inset-0 bg-black bg-opacity-50',
        onClick: () => setShowDeleteModal(false)
      }),
      React.createElement('div', {
        key: 'modal',
        className: 'bg-white rounded-lg p-6 max-w-md w-full relative',
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      }, [
        React.createElement('div', {
          key: 'header',
          className: 'flex items-center justify-between mb-6'
        }, [
          React.createElement('h3', {
            key: 'title',
            className: 'text-xl font-bold text-white flex items-center'
          }, [
            React.createElement(AlertTriangle, {
              key: 'warning-icon',
              className: 'h-6 w-6 mr-2'
            }),
            'Delete Account'
          ]),
          React.createElement('button', {
            key: 'close',
            onClick: () => setShowDeleteModal(false),
            className: 'text-white hover:text-gray-300'
          }, React.createElement(X, { className: 'h-6 w-6' }))
        ]),
        React.createElement('div', {
          key: 'content',
          className: 'mb-6'
        }, [
          React.createElement('p', {
            key: 'warning',
            className: 'text-white mb-4'
          }, 'Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.'),
          React.createElement('p', {
            key: 'confirmation',
            className: 'text-white font-semibold'
          }, 'Type "DELETE" to confirm:')
        ]),
        React.createElement('input', {
          key: 'confirm-input',
          type: 'text',
          value: deleteConfirmation,
          onChange: (e) => setDeleteConfirmation(e.target.value),
          className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black mb-6',
          placeholder: 'Type DELETE to confirm'
        }),
        React.createElement('div', {
          key: 'buttons',
          className: 'flex space-x-3'
        }, [
          React.createElement('button', {
            key: 'cancel',
            onClick: () => {
              setShowDeleteModal(false);
              setDeleteConfirmation('');
            },
            className: 'flex-1 px-4 py-2 border border-white text-white rounded-lg hover:bg-white hover:text-red-600 transition-colors'
          }, 'Cancel'),
          React.createElement('button', {
            key: 'delete',
            onClick: handleDeleteProfile,
            disabled: deleteConfirmation !== 'DELETE' || deleting,
            className: 'flex-1 px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-colors font-medium' + 
              (deleteConfirmation !== 'DELETE' ? ' opacity-50 cursor-not-allowed' : '')
          }, deleting ? 'Deleting...' : 'Delete Account')
        ])
      ])
    ])
  ]);
};

export default UserProfile;
