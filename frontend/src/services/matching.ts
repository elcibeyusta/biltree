import api from './api';

export interface Match {
  id: number;
  status: string;
  partner_profile: {
    initials: string;
    department: string;
    study_level: string;
    about_text: string;
    interests: Array<{ id: number; slug: string; display_name: string }>;
  } | null;
  created_at: string;
}

export const matchingService = {
  getMyMatch: async (): Promise<Match> => {
    const response = await api.get('/matching/me/');
    return response.data;
  },
};

