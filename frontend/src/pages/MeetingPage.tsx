import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { meetingService, Meeting, Location } from '../services/meeting';

const MeetingPage: React.FC = () => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [meetingData, locationsData] = await Promise.all([
        meetingService.getMyMeeting(),
        meetingService.getLocations(),
      ]);
      setMeeting(meetingData);
      setLocations(locationsData);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Error loading meeting:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-yildiz-dark text-white flex items-center justify-center px-4">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-yildiz-dark text-white">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <p className="text-gray-300">{t('meeting.noMeeting')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yildiz-dark text-white">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t('meeting.title')}</h1>

        {meeting.status === 'confirmed' && meeting.confirmed_slot ? (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
            <p className="font-semibold mb-2">{t('meeting.confirmed')}</p>
            <p className="mb-1">
              <strong>{t('meeting.date')}:</strong> {new Date(meeting.confirmed_slot.start_datetime).toLocaleString()}
            </p>
            {meeting.selected_location && (
              <p>
                <strong>{t('meeting.location')}:</strong> {meeting.selected_location.name}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-400 px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
            <p>{t('meeting.notConfirmed')}</p>
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-yildiz-gold">{t('meeting.proposedSlots')}</h2>
          {meeting.slots.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {meeting.slots.map((slot) => (
                <div
                  key={slot.id}
                  className="border border-white/10 rounded-xl p-4 bg-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4"
                >
                  <div className="text-sm sm:text-base text-gray-300">
                    <p>
                      {new Date(slot.start_datetime).toLocaleString()} -{' '}
                      {new Date(slot.end_datetime).toLocaleString()}
                    </p>
                  </div>
                  {!slot.is_selected && slot.proposed_by !== meeting.match?.user_a?.id && (
                    <button
                      onClick={async () => {
                        try {
                          await meetingService.confirmSlot(slot.id);
                          loadData();
                        } catch (err) {
                          console.error('Error confirming slot:', err);
                        }
                      }}
                      className="w-full sm:w-auto bg-yildiz-gold text-yildiz-dark px-4 py-2 rounded-xl hover:bg-yellow-400 transition-colors font-semibold text-sm sm:text-base"
                    >
                      {t('meeting.confirm')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-300 text-sm sm:text-base">{t('meeting.noSlots')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingPage;
