import api from './api';

export interface Profile {
  id: number;
  initials: string;
  department: string;
  study_level: string;
  about_text: string;
  interests: Array<{ id: number; slug: string; display_name: string }>;
  profile_completed: boolean;
}

export interface InterestTag {
  id: number;
  slug: string;
  display_name: string;
}

export const profileService = {
  getProfile: async (): Promise<Profile> => {
    const response = await api.get('/profile/me/');
    return response.data;
  },

  updateProfile: async (data: Partial<Profile>): Promise<Profile> => {
    const response = await api.put('/profile/me/', data);
    return response.data;
  },

  getInterests: async (): Promise<InterestTag[]> => {
    const response = await api.get('/profile/interests/');
    return response.data;
  },
};

