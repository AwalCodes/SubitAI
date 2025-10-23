import axios from 'axios'
import { createClient } from './supabase'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Create axios instance
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
      }
    } catch (error) {
      console.error('Failed to get auth token:', error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - don't redirect automatically to prevent loops
      console.log('Unauthorized access detected')
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

// API functions
export const apiClient = {
  // Auth
  auth: {
    getCurrentUser: () => api.get('/auth/me'),
    updateProfile: (data: any) => api.put('/auth/profile', data),
    verifyToken: () => api.get('/auth/verify'),
  },

  // Projects
  projects: {
    getProjects: (params?: { limit?: number; offset?: number }) => 
      api.get('/projects/', { params }),
    getProject: (id: string) => api.get(`/projects/${id}`),
    updateProject: (id: string, data: any) => api.put(`/projects/${id}`, data),
    deleteProject: (id: string) => api.delete(`/projects/${id}`),
    uploadVideo: (file: File, title?: string) => {
      const formData = new FormData()
      formData.append('file', file)
      if (title) formData.append('title', title)
      return api.post('/projects/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
  },

  // Subtitles
  subtitles: {
    getSubtitles: (projectId: string) => api.get(`/subtitles/${projectId}`),
    updateSubtitles: (projectId: string, data: any) => 
      api.put(`/subtitles/${projectId}`, data),
    generateSubtitles: (projectId: string, language?: string) =>
      api.post(`/subtitles/generate/${projectId}`, { language }),
    translateSubtitles: (projectId: string, targetLanguage: string) =>
      api.post(`/subtitles/${projectId}/translate`, { target_language: targetLanguage }),
    downloadSubtitles: (projectId: string, format: string = 'srt') =>
      api.get(`/subtitles/${projectId}/download`, { params: { format } }),
  },

  // Export
  export: {
    exportVideo: (projectId: string, options: any) =>
      api.post(`/export/video/${projectId}`, options),
    getExportStatus: (projectId: string) =>
      api.get(`/export/video/${projectId}/status`),
    exportSrt: (projectId: string) =>
      api.post(`/export/srt/${projectId}`),
    downloadVideo: (projectId: string) =>
      api.get(`/export/download/${projectId}`),
  },

  // Billing
  billing: {
    getPlans: () => api.get('/billing/plans'),
    createCheckoutSession: (priceId: string) =>
      api.post('/billing/create-checkout-session', { price_id: priceId }),
    createPortalSession: () => api.post('/billing/create-portal-session'),
    getSubscription: () => api.get('/billing/subscription'),
  },
}

export default apiClient








