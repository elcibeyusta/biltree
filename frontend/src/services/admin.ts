import api from './api';

export interface AdminStats {
  total_users: number;
  verified_users: number;
  completed_profiles: number;
  pending_matches: number;
  active_matches: number;
  confirmed_meetings: number;
  exchanged_gifts: number;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  email_verified: boolean;
  created_at: string;
}

export interface Match {
  id: number;
  user_a: number;
  user_b: number;
  user_c?: number;
  user_a_email: string;
  user_b_email: string;
  user_c_email?: string;
  status: string;
  created_at: string;
}

export interface EventConfig {
  event_year: number;
  registration_open: string;
  registration_close: string;
  matching_start_date: string;
  min_budget: string;
  max_budget: string;
  allowed_email_domains: string[];
  is_active: boolean;
}

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats/');
    return response.data;
  },

  getUsers: async (search?: string, emailVerified?: boolean, isActive?: boolean): Promise<User[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (emailVerified !== undefined) params.append('email_verified', String(emailVerified));
    if (isActive !== undefined) params.append('is_active', String(isActive));
    
    const response = await api.get(`/admin/users/?${params.toString()}`);
    return response.data;
  },

  getMatches: async (): Promise<Match[]> => {
    const response = await api.get('/admin/matches/');
    return response.data;
  },

  getMeetings: async () => {
    const response = await api.get('/admin/meetings/');
    return response.data;
  },

  getConfig: async (): Promise<EventConfig> => {
    const response = await api.get('/event/config/');
    return response.data;
  },

  updateConfig: async (data: Partial<EventConfig>): Promise<EventConfig> => {
    const response = await api.put('/admin/config/', data);
    return response.data;
  },

  runMatching: async () => {
    const response = await api.post('/matching/run/');
    return response.data;
  },

  updateMatch: async (matchId: number, data: Partial<Match>): Promise<Match> => {
    const response = await api.patch(`/admin/matches/${matchId}/`, data);
    return response.data;
  },

  deleteMatch: async (matchId: number): Promise<void> => {
    await api.delete(`/admin/matches/${matchId}/delete/`);
  },

  deployMatches: async () => {
    const response = await api.post('/admin/matches/deploy/');
    return response.data;
  },

  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/admin/users/${userId}/delete/`);
  },

  sendVerificationEmails: async (): Promise<{ message: string; sent_count: number; total_unverified: number }> => {
    const response = await api.post('/admin/users/send-verification/');
    return response.data;
  },
};

