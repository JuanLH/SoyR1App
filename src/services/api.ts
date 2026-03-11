import axios from 'axios'
import { getCookie } from '../utils/cookies'

// ─── Configuration ────────────────────────────────────────────────────────────
// Change this value to point to a different backend.
export const API_BASE_URL = 'https://localhost:7007'

// ─── Axios instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request interceptor — attach JWT automatically ───────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = getCookie('auth_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response interceptor — handle global errors ──────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — let session guard handle the redirect
      console.warn('Unauthorized — session may have expired.')
    }
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default api