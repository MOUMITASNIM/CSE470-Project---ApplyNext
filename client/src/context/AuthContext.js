import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

import { isTokenExpired } from '../utils/tokenUtils';

// Configure axios to include credentials
axios.defaults.withCredentials = true;

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case 'ADMIN_LOADED':
      return {
        ...state,
        user: action.payload,
        isAdmin: true,
        loading: false,
      };
    case 'USER_UPDATED':
      return {
        ...state,
        user: action.payload,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
      };
    case 'ADMIN_LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.admin,
        isAdmin: true,
        isAuthenticated: true,
        loading: false,
        isAdmin: true,
        loading: false,
      };
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        loading: false,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        loading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user
  const loadUser = async () => {
    try {
      // Check if token in cookie is expired
      const token = document.cookie.split('; ').find(row => row.startsWith('token=') || row.startsWith('adminToken='));
      if (token) {
        const tokenValue = token.split('=')[1];
        if (isTokenExpired(tokenValue)) {
          console.log('Token expired, logging out');
          await logout();
          return;
        }
      }

      // Try to get current user (cookies will be sent automatically)
      const res = await axios.get('/api/auth/me');
      if (res.data.success) {
        dispatch({ 
          type: res.data.data.user.role === 'admin' ? 'ADMIN_LOADED' : 'USER_LOADED', 
          payload: res.data.data.user 
        });
      } else {
        dispatch({ type: 'AUTH_ERROR' });
      }
    } catch (error) {
      console.error('Load user error:', error);
      // If token is expired or invalid, clear state
      if (error.response?.status === 401) {
        await logout();
      } else {
        dispatch({ type: 'AUTH_ERROR' });
      }
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      const res = await axios.post('/api/auth/register', formData);
      if (res.data.success) {
        dispatch({ type: 'REGISTER_SUCCESS', payload: res.data.data });
        toast.success('Registration successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const res = await axios.post('/api/auth/login', formData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data.data });
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Update user
  const updateUser = (updatedUser) => {
    dispatch({ type: 'USER_UPDATED', payload: updatedUser });
  };

  // Admin login
  const adminLogin = async (formData) => {
    try {
      // Clear any existing tokens first - don't wait for response
      try {
        await axios.post('/api/auth/logout');
        dispatch({ type: 'LOGOUT' });
      } catch (error) {
        console.log('Error clearing session (continuing anyway):', error);
      }
      
      // Attempt admin login with hardcoded credentials
      const res = await axios.post('/api/auth/admin-login', {
        email: 'admin@admin.com',
        password: 'admin123'
      });
      
      if (res.data.success) {
        dispatch({ type: 'ADMIN_LOGIN_SUCCESS', payload: res.data.data });
        toast.success('Admin login successful!');
        return { success: true };
      }
      
      toast.error('Admin login failed');
      return { success: false };
    } catch (error) {
      console.error('Admin login error:', error);
      const message = error.response?.data?.message || 'Admin login failed';
      toast.error(message);
      dispatch({ type: 'AUTH_ERROR' });
      return { success: false, message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Call the logout endpoint to clear cookies
      await axios.post('/api/auth/logout');
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear the local state even if the server call fails
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Update user profile
  const updateProfile = async (formData) => {
    try {
      const res = await axios.put('/api/user/profile', formData);
      dispatch({ type: 'USER_LOADED', payload: res.data.data.user });
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        loading: state.loading,
        register,
        login,
        adminLogin,
        logout,
        updateProfile,
        loadUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 