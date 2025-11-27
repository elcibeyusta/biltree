import api from './api';

export interface Location {
  id: number;
  name: string;
  description: string;
}

export interface MeetingSlot {
  id: number;
  proposed_by: number;
  start_datetime: string;
  end_datetime: string;
  is_selected: boolean;
}

export interface Meeting {
  id: number;
  status: string;
  selected_location: Location | null;
  location_notes: string;
  confirmed_slot: MeetingSlot | null;
  slots: MeetingSlot[];
  gift_exchanged: boolean;
  match?: {
    user_a?: { id: number };
    user_b?: { id: number };
  };
}

export const meetingService = {
  getMyMeeting: async (): Promise<Meeting> => {
    const response = await api.get('/meeting/me/');
    return response.data;
  },

  createSlots: async (slots: Array<{ start_datetime: string; end_datetime: string }>) => {
    const response = await api.post('/meeting/me/slots/', { slots });
    return response.data;
  },

  confirmSlot: async (slotId: number, locationId?: number, locationNotes?: string) => {
    const response = await api.post(`/meeting/me/confirm-slot/${slotId}/`, {
      location_id: locationId,
      location_notes: locationNotes,
    });
    return response.data;
  },

  markExchanged: async () => {
    const response = await api.patch('/meeting/me/mark-exchanged/');
    return response.data;
  },

  getLocations: async (): Promise<Location[]> => {
    const response = await api.get('/meeting/locations/');
    return response.data;
  },
};

