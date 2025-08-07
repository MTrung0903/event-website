import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from './api';

const ResetPassword = () => {
  const { t } = useTranslation(); // Hook to access translations
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL query parameter
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tokenFromUrl = query.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError(t('resetPassword.passwordsNotMatch'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.resetPassword(token, newPassword);
      if (response.statusCode === 200) {
        setMessage(t('resetPassword.successMessage'));
        setError('');
      } else {
        setError(response.msg || t('resetPassword.errorMessage'));
        setMessage('');
      }
    } catch (error) {
      setError(error.msg || t('resetPassword.errorMessage'));
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-center">{t('resetPassword.title')}</h2>
        {message && <p className="mb-4 text-center text-green-500">{message}</p>}
        {error && <p className="mb-4 text-center text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">                 
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('resetPassword.newPasswordLabel')}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="block w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              placeholder={t('resetPassword.newPasswordPlaceholder')}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('resetPassword.confirmPasswordLabel')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              placeholder={t('resetPassword.confirmPasswordPlaceholder')}
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white p-2 rounded-md transition ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
            disabled={isLoading}
          >
            {isLoading ? t('resetPassword.submittingButton') : t('resetPassword.submitButton')}
          </button>
        </form>
        <p className="mt-4 text-center">
          <a href="/login" className="text-blue-600 hover:underline">{t('resetPassword.backToLogin')}</a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
