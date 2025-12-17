import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { profileService, Profile, InterestTag } from '../services/profile';
import { DEPARTMENTS, STUDY_LEVELS } from '../utils/constants';

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [interests, setInterests] = useState<InterestTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, interestsData] = await Promise.all([
        profileService.getProfile(),
        profileService.getInterests(),
      ]);
      setProfile(profileData);
      setInterests(interestsData);
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage('');

    try {
      const formData = new FormData(e.currentTarget);
      const updatedProfile = await profileService.updateProfile({
        initials: formData.get('initials') as string,
        department: formData.get('department') as string,
        study_level: formData.get('study_level') as string,
        about_text: formData.get('about_text') as string,
        interests: Array.from(formData.getAll('interests')).map(Number) as any,
      });
      setProfile(updatedProfile);
      setMessage(t('profile.updateSuccess'));
    } catch (err: any) {
      setMessage(err.response?.data?.message || t('profile.updateError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-yildiz-dark text-white flex items-center justify-center px-4">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-yildiz-dark text-white flex items-center justify-center px-4">
        <p>Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yildiz-dark text-white">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t('profile.title')}</h1>

        {message && (
          <div
            className={`mb-4 sm:mb-6 px-4 py-3 rounded-lg text-sm sm:text-base ${
              message.includes('success')
                ? 'bg-green-500/10 border border-green-500/50 text-green-400'
                : 'bg-red-500/10 border border-red-500/50 text-red-400'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              {t('profile.initials')}
            </label>
            <input
              type="text"
              name="initials"
              defaultValue={profile.initials}
              maxLength={10}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yildiz-gold/50 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
            />
          </div>

          <div className="mb-4 sm:mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              {t('profile.department')}
            </label>
            <select
              name="department"
              defaultValue={profile.department}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yildiz-gold/50 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept.value} value={dept.value} className="bg-yildiz-dark">
                  {t(dept.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4 sm:mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              {t('profile.studyLevel')}
            </label>
            <select
              name="study_level"
              defaultValue={profile.study_level}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yildiz-gold/50 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
            >
              {STUDY_LEVELS.map((level) => (
                <option key={level.value} value={level.value} className="bg-yildiz-dark">
                  {t(level.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4 sm:mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              {t('profile.aboutMe')}
            </label>
            <textarea
              name="about_text"
              defaultValue={profile.about_text}
              maxLength={500}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yildiz-gold/50 focus:border-transparent transition-all duration-300 text-sm sm:text-base resize-none"
              placeholder={t('profile.aboutMePlaceholder')}
            />
          </div>

          <div className="mb-6 sm:mb-8">
            <label className="block text-gray-300 text-sm font-medium mb-3">
              {t('profile.interests')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {interests.map((interest) => (
                <label key={interest.id} className="flex items-center text-sm sm:text-base">
                  <input
                    type="checkbox"
                    name="interests"
                    value={interest.id}
                    defaultChecked={profile.interests.some((i) => i.id === interest.id)}
                    className="mr-2 w-4 h-4 text-yildiz-gold bg-white/5 border-white/10 rounded focus:ring-yildiz-gold/50"
                  />
                  <span className="text-gray-300">{interest.display_name}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-yildiz-gold text-yildiz-dark font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yildiz-gold/20 text-sm sm:text-base"
          >
            {saving ? t('common.loading') : t('common.save')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
