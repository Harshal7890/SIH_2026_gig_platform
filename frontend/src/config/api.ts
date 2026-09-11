/* API configuration */
export const API_BASE_URL = 'http://localhost:8000';

export const ROUTES = {
  cooperative: {
    register: `${API_BASE_URL}/cooperative/register`,
    login: `${API_BASE_URL}/cooperative/login`,
  },
  worker: {
    register: `${API_BASE_URL}/worker/register`,
    login: `${API_BASE_URL}/worker/login`,
  },
  customer: {
    register: `${API_BASE_URL}/customer/register`,
    login: `${API_BASE_URL}/customer/login`,
  },
  health: `${API_BASE_URL}/health`,
} as const;
