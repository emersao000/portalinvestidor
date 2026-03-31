import axios from 'axios'

// IMPORTANTE: VITE_API_URL deve ser sempre relativo (/api/v1) para o proxy do Vite funcionar.
// Nunca use http://IP:8000 aqui — isso causa CORS ao acessar de outros dispositivos na rede.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('portal_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('portal_token')
      localStorage.removeItem('portal_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
