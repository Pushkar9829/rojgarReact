import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');

  useEffect(() => {
    // Check if user d is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role === 'ADMIN') {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const sendOTP = async (mobile) => {
    try {
      setMobileNumber(mobile);
      await authAPI.sendOTP(mobile, 'LOGIN');
      setOtpSent(true);
      toast.success('OTP sent successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
      throw error;
    }
  };

  const verifyOTP = async (otp, adminProfile = {}) => {
    try {
      const response = await authAPI.verifyOTP(mobileNumber, otp, adminProfile);
      const { token, user: userData } = response.data.data;
      
      if (userData.role !== 'ADMIN') {
        toast.error('Access denied. Admin account required.');
        return false;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setOtpSent(false);
      toast.success('Login successful');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
      return false;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setOtpSent(false);
    setMobileNumber('');
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    otpSent,
    mobileNumber,
    sendOTP,
    verifyOTP,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};