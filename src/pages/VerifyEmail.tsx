import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import ApiService from '../services/ApiService';

const VerifyEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, type } = location.state || {};
  
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Start countdown when component mounts
  useEffect(() => {
    setResendCountdown(45);
    setCanResend(false);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    // Clear errors when user starts typing
    if (errors.code) {
      setErrors({ ...errors, code: '' });
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...verificationCode];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newCode[i] = pastedData[i];
    }
    
    setVerificationCode(newCode);
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newCode.findIndex(code => !code);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    const targetInput = document.getElementById(`code-${focusIndex}`);
    targetInput?.focus();
  };

  const validateCode = () => {
    const code = verificationCode.join('');
    const newErrors: { [key: string]: string } = {};

    if (code.length !== 6) {
      newErrors.code = 'Please enter the complete 6-digit verification code';
    } else if (!/^\d{6}$/.test(code)) {
      newErrors.code = 'Verification code must contain only numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCode()) return;

    setIsLoading(true);
    
    try {
      const code = verificationCode.join('');
      
      const result = await ApiService.verifyEmail(email, code, type);
      
      if (result) {
        if (type === 'forgot-password') {
          navigate('/reset-password', { state: { email, verificationCode: code } });
        } else {
          // Signup verification successful
          navigate('/login', { 
            state: { 
              message: 'Account created successfully! Please sign in with your credentials.' 
            }
          });
        }
      } else {
        setErrors({ code: 'Invalid verification code. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'Verification failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    
    try {
      // Resend verification code
      if (type === 'forgot-password') {
        await ApiService.forgotPassword(email);
      } else {
        // For signup, we need to resend the signup verification
        // This would typically be a separate endpoint
        await ApiService.forgotPassword(email); // Using same endpoint for now
      }
      
      // Reset countdown
      setResendCountdown(45);
      setCanResend(false);
      
      // Clear current code
      setVerificationCode(['', '', '', '', '', '']);
      
      // Focus first input
      const firstInput = document.getElementById('code-0');
      firstInput?.focus();
      
    } catch (error) {
      setErrors({ general: 'Failed to resend code. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getBackLink = () => {
    if (type === 'forgot-password') {
      return '/forgot-password';
    }
    return '/signup';
  };

  const getTitle = () => {
    if (type === 'forgot-password') {
      return 'Reset Password Verification';
    }
    return 'Verify Your Email';
  };

  const getDescription = () => {
    if (type === 'forgot-password') {
      return 'Enter the 6-digit verification code sent to your email to reset your password.';
    }
    return 'Enter the 6-digit verification code sent to your email to complete your account setup.';
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              to={getBackLink()}
              className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </div>

          {/* Logo */}
          <div className="text-center mb-8">
            <img 
              src="/FullLogo_Transparent_NoBuffer.png" 
              alt="Nova Space" 
              className="h-12 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{getTitle()}</h1>
            <p className="text-gray-600 mb-2">{getDescription()}</p>
            <p className="text-sm text-gray-500">
              Code sent to: <strong>{email}</strong>
            </p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-red-700 text-sm">{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Verification Code Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Enter Verification Code
              </label>
              <div className="flex justify-center space-x-3 mb-2">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-12 h-12 text-center text-lg font-bold border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.code ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                ))}
              </div>
              {errors.code && (
                <p className="text-sm text-red-600 text-center flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.code}
                </p>
              )}
            </div>

            {/* Resend Code */}
            <div className="text-center">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend Code
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  Resend code in {resendCountdown} seconds
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify Code'
              )}
            </button>
          </form>

          {/* Additional Help */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code? Check your spam folder or{' '}
              {canResend ? (
                <button
                  onClick={handleResendCode}
                  className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200"
                >
                  resend it
                </button>
              ) : (
                <span className="text-gray-400">wait {resendCountdown}s to resend</span>
              )}
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
      </div>
    </div>
  );
};

export default VerifyEmail;