import api from './api';

export interface RegisterData {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    email_verified: boolean;
    is_staff?: boolean;
  };
}

export const authService = {
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register/', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login/', data);
    const { access, refresh, user } = response.data;
    
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    return { access, refresh, user };
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await api.post('/auth/logout/', { refresh: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  verifyEmail: async (token: string) => {
    const response = await api.post('/auth/verify-email/', { token });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password/', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string, password_confirm: string) => {
    const response = await api.post('/auth/reset-password/', {
      token,
      password,
      password_confirm,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me/');
    return response.data;
  },
};

