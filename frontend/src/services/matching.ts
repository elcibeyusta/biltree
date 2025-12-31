import api from './api';

export interface Match {
  id: number;
  status: string;
  partner_profile: {
    initials: string;
    department: string;
    study_level: string;
    about_text: string;
  } | null;
  seen: boolean;
  created_at: string;
}

export interface Message {
  id: number;
  sender_email: string;
  content: string;
  created_at: string;
  read: boolean;
  is_own: boolean;
}

export const matchingService = {
  getMyMatch: async (): Promise<Match> => {
    const response = await api.get('/matching/me/');
    return response.data;
  },

  markSeen: async (): Promise<void> => {
    await api.post('/matching/seen/');
  },

  getMessages: async (): Promise<Message[]> => {
    const response = await api.get('/matching/messages/');
    return response.data;
  },

  sendMessage: async (content: string): Promise<Message> => {
    const response = await api.post('/matching/messages/send/', { content });
    return response.data;
  },

  markMessagesRead: async (): Promise<void> => {
    await api.post('/matching/messages/read/');
  },
};

