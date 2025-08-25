import axios from 'axios';
import { logoutUser } from '../utils/logoutUser';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  config => {
    console.log(`start loading ${config.url}`);
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error?.response?.status === 401) {
      logoutUser();
    }

    return Promise.reject(error);
  },
);

export default api;
