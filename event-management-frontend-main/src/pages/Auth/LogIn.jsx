import React, { useState, } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from './api';
import { useAuth } from './AuthProvider';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import Loader from "../../components/Loading";
const LoginForm = () => {
  const { t } = useTranslation(); // Hook to access translations
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await api.login(email, password);
      const token = response.data;
      if (!token) {
        setIsLoading(false);
        throw new Error(t('login.errorMessage'));
      }

      const decoded = jwtDecode(token);
      login(token, decoded);

      // Check redirectEventId in localStorage
      const redirectEventId = localStorage.getItem('redirectEventId');
      if (redirectEventId) {
        // Redirect to event detail page
        navigate(`/event/${redirectEventId}`);
        // Remove redirectEventId after use
        localStorage.removeItem('redirectEventId');
      } else {
        // Default redirect based on role
        const primaryRole = decoded.roles.includes('ROLE_ADMIN') ? 'ADMIN' :
          decoded.roles.includes('ROLE_ORGANIZER') ? 'ORGANIZER' : 'ATTENDEE';
        if (primaryRole === 'ADMIN') navigate('/admin');
        else if (primaryRole === 'ORGANIZER') navigate('/dashboard');
        else navigate('/');
      }
    } catch (error) {
      if (error.response?.status === 403) {
        Swal.fire({
          icon: 'warning',
          title: 'Tài khoản bị khóa',
          text: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi đăng nhập',
          text: error.msg || error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.',
        });
      }
      setError(error.msg || error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.');
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center z-10">
          <Loader />
        </div>
      )}
      <div className="w-full max-w-md p-10 transition-all duration-300 transform bg-white shadow-md rounded-xl sm:max-w-lg animate-in">
        <h2 className="mb-6 text-3xl font-bold text-center text-gray-800">{t('login.title')}</h2>
        {error && (
          <div className="flex items-center p-4 mb-6 text-red-600 border border-red-200 rounded-lg bg-red-50">
            <i className="mr-2 fas fa-exclamation-circle"></i>
            <p id="error-message" className="text-sm">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('login.emailLabel')}</label>
            <div className="relative mt-1">
              <i className="absolute text-gray-400 transform -translate-y-1/2 fas fa-envelope left-3 top-1/2"></i>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full py-3 pl-10 pr-3 transition-colors border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                required
                placeholder={t('login.emailPlaceholder')}
                aria-label={t('login.emailAriaLabel')}
                aria-describedby={error ? "error-message" : undefined}
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t('login.passwordLabel')}</label>
            <div className="relative mt-1">
              <i className="absolute text-gray-400 transform -translate-y-1/2 fas fa-lock left-3 top-1/2"></i>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full py-3 pl-10 pr-3 transition-colors border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                required
                placeholder={t('login.passwordPlaceholder')}
                aria-label={t('login.passwordAriaLabel')}
                aria-describedby={error ? "error-message" : undefined}
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 font-medium text-white transition-colors bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
          >
            {t('login.submitButton')}
          </button>
        </form>
        <div className="mt-6 space-y-2 text-center">
          <p>
            <a href="/forgot" className="font-medium text-orange-500 transition-colors hover:text-orange-600">
              {t('login.forgotPasswordLink')}
            </a>
          </p>
          <p className="text-gray-600">
            {t('login.signupPrompt')}{' '}
            <a href="/signup" className="font-medium text-orange-500 transition-colors hover:text-orange-600">
              {t('login.signupLink')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
