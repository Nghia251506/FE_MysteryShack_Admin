import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_URL;  // Hoặc môi trường prod: process.env.REACT_APP_API_URL

// Axios instance với withCredentials để gửi cookie JWT
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // BẮT BUỘC: để gửi cookie JWT cross-origin
});

export default api;