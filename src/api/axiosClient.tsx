import axios from "axios";
const API_BASE_URL = 'http://localhost:8080/api';  // Hoặc môi trường prod: process.env.REACT_APP_API_URL

// Axios instance với withCredentials để gửi cookie JWT
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,  // BẮT BUỘC: để gửi cookie JWT cross-origin
});

export default api;