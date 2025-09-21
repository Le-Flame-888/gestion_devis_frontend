import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Fetch CSRF cookie before making any requests
const fetchCsrfToken = async () => {
  try {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
};

// Fetch CSRF token on initial load
fetchCsrfToken();

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      // Don't redirect here, let the AuthContext handle it
    }
    
    // For 422 validation errors, format the error response
    if (error.response?.status === 422 && error.response?.data?.errors) {
      const formattedErrors: Record<string, string> = {};
      const backendErrors = error.response.data.errors;
      
      // Format the errors to match the form's expected format
      for (const [key, value] of Object.entries(backendErrors)) {
        // Handle nested errors (e.g., details.0.quantite)
        if (key.startsWith('details.') && key.includes('.')) {
          const [_, index, field] = key.split('.');
          const errorKey = `detail_${index}_${field}`;
          formattedErrors[errorKey] = Array.isArray(value) ? value[0] : String(value);
        } else {
          formattedErrors[key] = Array.isArray(value) ? value[0] : String(value);
        }
      }
      
      // Return a custom error with the formatted errors
      const formattedError = {
        ...error,
        response: {
          ...error.response,
          data: {
            ...error.response.data,
            formattedErrors
          }
        }
      };
      
      console.error('Formatted validation error:', formattedError);
      return Promise.reject(formattedError);
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error);
      return Promise.reject({
        ...error,
        message: 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.'
      });
    }
    
    // Handle other errors
    console.error('Unhandled API error:', error);
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/login', { email, password }),
  
  register: (name: string, email: string, password: string, password_confirmation: string) =>
    api.post('/register', { name, email, password, password_confirmation }),
  
  logout: () => api.post('/logout'),
  
  getUser: () => api.get('/user'),
};

// Products API
export const productsAPI = {
  getAll: (page = 1) => api.get(`/products?page=${page}`),
  getById: (id: number) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: number, data: any) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
};

// Clients API
export const clientsAPI = {
  getAll: (page = 1) => api.get(`/clients?page=${page}`),
  getById: (id: number) => api.get(`/clients/${id}`),
  create: (data: any) => api.post('/clients', data),
  update: (id: number, data: any) => api.put(`/clients/${id}`, data),
  delete: (id: number) => api.delete(`/clients/${id}`),
};

// Quotes API
export const quotesAPI = {
  getAll: (page = 1) => api.get(`/quotes?page=${page}`),
  getById: (id: number) => api.get(`/quotes/${id}`),
  create: (data: any) => api.post('/quotes', data),
  update: (id: number, data: any) => api.put(`/quotes/${id}`, data),
  delete: (id: number) => api.delete(`/quotes/${id}`),
  addProduct: (quoteId: number, data: any) => api.post(`/quotes/${quoteId}/products`, data),
  removeProduct: (quoteId: number, detailId: number) => api.delete(`/quotes/${quoteId}/products/${detailId}`),
};

export default api;
