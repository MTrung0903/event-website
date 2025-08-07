import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from './api';

const ForgotPassword = () => {
  const { t } = useTranslation(); // Hook to access translations
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      const response = await api.forgotPassword(email);
      if (response.statusCode === 200) {
        setMessage(t('forgotPassword.successMessage'));
        setError('');
 
      } else {
        setError(response.msg || t('forgotPassword.errorMessage'));
        setMessage('');
      }
    } catch (error) {
      setError(error.msg || t('forgotPassword.errorMessage'));
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-center">{t('forgotPassword.title')}</h2>
        {message && <p className="mb-4 text-center text-green-500">{message}</p>}
        {error && <p className="mb-4 text-center text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('forgotPassword.emailLabel')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              required
              placeholder={t('forgotPassword.emailPlaceholder')}
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
            {isLoading ? t('forgotPassword.submittingButton') : t('forgotPassword.submitButton')}
          </button>
        </form>
        <p className="mt-4 text-center">
          <a href="/login" className="text-blue-600 hover:underline">{t('forgotPassword.backToLogin')}</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
