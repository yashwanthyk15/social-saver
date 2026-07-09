import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let token = localStorage.getItem('ss-token') || null;

export const setToken = (t) => { 
  token = t; 
  if (t) localStorage.setItem('ss-token', t);
  else localStorage.removeItem('ss-token');
};
export const getToken = () => token;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 403) {
      window.dispatchEvent(new CustomEvent('session-expired'));
    }
    return Promise.reject(err);
  }
);
