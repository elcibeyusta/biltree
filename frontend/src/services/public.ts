import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Public API client (no auth required)
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface PublicStats {
  total_participants: number;
  total_registered: number;
}

export const publicService = {
  getStats: async (): Promise<PublicStats> => {
    const response = await publicApi.get('/public/stats/');
    return response.data;
  },
};

