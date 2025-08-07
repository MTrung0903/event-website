import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

export const api = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      return response.data; // { statusCode, msg, data: token }
    } catch (error) {
      throw error.response?.data || { statusCode: 500, msg: 'Error', data: 'Server error' };
    }
  },

  register: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/register`, { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { statusCode: 500, msg: 'Error', data: 'Server error' };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/forgot`, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { statusCode: 500, msg: 'Error', data: 'Server error' };
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/reset-password`, { token, newPassword });
      return response.data;
    } catch (error) {
      throw error.response?.data || { statusCode: 500, msg: 'Error', data: 'Server error' };
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { statusCode: 500, msg: 'Error', data: 'Server error' };
    }
  }
};