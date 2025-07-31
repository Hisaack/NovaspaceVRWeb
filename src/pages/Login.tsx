import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, User, Building } from 'lucide-react';
import AuthService from '../services/AuthService';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<'admin' | 'virtual'>('admin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    organizationName: '',
    userCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [virtualUserEmail, setVirtualUserEmail] = useState('');

  const validateAdminForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateVirtualForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }

    if (!formData.userCode.trim()) {
      newErrors.userCode = 'User code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOTP = () => {
    const code = otpCode.join('');
    const newErrors: { [key: string]: string } = {};

    if (code.length !== 6) {
      newErrors.otp = 'Please enter the complete 6-digit code';
    } else if (!/^\d{6}$/.test(code)) {
      newErrors.otp = 'Code must contain only numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginType === 'admin' && !validateAdminForm()) return;
    if (loginType === 'virtual' && !validateVirtualForm()) return;

    setIsLoading(true);
    
    try {
      if (loginType === 'admin') {
        const result = await AuthService.login(formData.email, formData.password);
        
        if (result.success) {
          if (result.requiresTwoFactor) {
            // Handle 2FA case if needed
            setErrors({ general: 'Two-factor authentication required. Please check your email.' });
          } else {
            navigate('/');
          }
        } else {
          setErrors({ general: result.message || 'Invalid email or password' });
        }
      } else {
        // Virtual user login
        const result = await AuthService.virtualUserLogin(formData.organizationName, formData.userCode);
        
        if (result.success && result.requiresTwoFactor) {
          setVirtualUserEmail(result.virtualUserEmail || '');
          // Store virtual user data in localStorage for the virtual dashboard
          localStorage.setItem('virtualUserData', JSON.stringify({
            userCode: formData.userCode,
            organizationName: formData.organizationName,
            email: result.virtualUserEmail
          }));
          setShowOTPModal(true);
        } else {
          setErrors({ general: result.message || 'Virtual user not found. Please check your details.' });
        }
      }
    } catch (error) {
      setErrors({ general: loginType === 'admin' ? 'Login failed. Please try again.' : 'Virtual user login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateOTP()) return;

    setIsLoading(true);
    
    try {
      const code = otpCode.join('');
      
      if (loginType === 'admin') {
        // Handle admin 2FA verification if needed
        // This would be implemented when 2FA is enabled for admin
        navigate('/');
      } else {
        // Virtual user OTP verification
        const result = await AuthService.verifyVirtualUserOtp(virtualUserEmail, code);
        
        if (result.success) {
          // Navigate to virtual user dashboard
          window.location.href = '/virtual-dashboard';
        } else {
          setErrors({ otp: result.message || 'Invalid verification code. Please try again.' });
        }
      }
    } catch (error) {
      setErrors({ general: 'Verification failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...otpCode];
    newCode[index] = value;
    setOtpCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Clear errors when user starts typing
    if (errors.otp) {
      setErrors({ ...errors, otp: '' });
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const switchLoginType = (type: 'admin' | 'virtual') => {
    setLoginType(type);
    setFormData({
      email: '',
      password: '',
      organizationName: '',
      userCode: ''
    });
    setErrors({});
    setShowOTPModal(false);
    setOtpCode(['', '', '', '', '', '']);
    setVirtualUserEmail('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Logo */}
          <div className="text-center mb-8">
            <img 
              src="/FullLogo_Transparent_NoBuffer.png" 
              alt="Nova Space" 
              className="h-12 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{loginType === 'admin' ? 'Admin Portal' : 'Virtual User Portal'}</h1>
            <p className="text-gray-600">{loginType === 'admin' ? 'Sign in to your Nova Space account' : 'Access your training dashboard'}</p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-red-700 text-sm">{errors.general}</span>
            </div>
          )}

          {/* Login Type Switcher */}
          <div className="mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => switchLoginType('admin')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  loginType === 'admin' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Admin Login
              </button>
              <button
                type="button"
                onClick={() => switchLoginType('virtual')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  loginType === 'virtual' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Virtual User
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {loginType === 'admin' ? (
              <>
                {/* Admin Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Admin Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Virtual User Organization Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.organizationName}
                      onChange={(e) => handleInputChange('organizationName', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        errors.organizationName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your organization name"
                    />
                  </div>
                  {errors.organizationName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.organizationName}
                    </p>
                  )}
                </div>

                {/* Virtual User Code Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Code
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.userCode}
                      onChange={(e) => handleInputChange('userCode', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        errors.userCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your user code"
                    />
                  </div>
                  {errors.userCode && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.userCode}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                loginType === 'admin' ? 'Sign In' : 'Send OTP Code'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          {loginType === 'admin' && (
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
      </div>

      {/* OTP Modal for Virtual Users */}
      {showOTPModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Verification Code</h2>
              <p className="text-gray-600 mb-2">
                We've sent a 6-digit code to your email
              </p>
              <p className="text-sm text-gray-500">
                <strong>{virtualUserEmail}</strong>
              </p>
            </div>

            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <span className="text-red-700 text-sm">{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleOTPSubmit} className="space-y-6">
              <div>
                <div className="flex justify-center space-x-3 mb-2">
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      className={`w-12 h-12 text-center text-lg font-bold border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        errors.otp ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  ))}
                </div>
                {errors.otp && (
                  <p className="text-sm text-red-600 text-center flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.otp}
                  </p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowOTPModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify & Sign In'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;