import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService, AdminStats, User, Match, EventConfig } from '../services/admin';

const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'matches' | 'config'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [editFormData, setEditFormData] = useState<{user_a: number, user_b: number, user_c?: number} | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, matchesData, configData] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getMatches(),
        adminService.getConfig(),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setMatches(matchesData);
      setConfig(configData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleRunMatching = async () => {
    if (!confirm(t('admin.runMatchingConfirm'))) {
      return;
    }

    try {
      setMessage('');
      setError('');
      const result = await adminService.runMatching();
      setMessage(t('admin.runMatchingSuccess', { count: result.matches_count }));
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to run matching');
    }
  };

  const handleDeployMatches = async () => {
    if (!confirm('Deploy all pending matches to users? This will make matches visible to participants.')) {
      return;
    }

    try {
      setMessage('');
      setError('');
      const result = await adminService.deployMatches();
      setMessage(result.message || `Successfully deployed ${result.deployed_count} matches.`);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to deploy matches');
    }
  };

  const handleDeleteMatch = async (matchId: number) => {
    if (!confirm('Are you sure you want to delete this match?')) {
      return;
    }

    try {
      setMessage('');
      setError('');
      await adminService.deleteMatch(matchId);
      setMessage('Match deleted successfully.');
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete match');
    }
  };

  const handleEditMatch = (match: Match) => {
    setEditingMatch(match);
    setEditFormData({
      user_a: match.user_a,
      user_b: match.user_b,
      user_c: match.user_c || undefined
    });
  };

  const handleSaveMatch = async () => {
    if (!editingMatch || !editFormData) return;

    try {
      setMessage('');
      setError('');
      await adminService.updateMatch(editingMatch.id, editFormData);
      setMessage('Match updated successfully.');
      setEditingMatch(null);
      setEditFormData(null);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update match');
    }
  };

  const handleCancelEdit = () => {
    setEditingMatch(null);
    setEditFormData(null);
  };

  const handleSendVerificationEmails = async () => {
    const unverifiedCount = users.filter(u => !u.email_verified).length;
    if (unverifiedCount === 0) {
      setError('No unverified users found.');
      return;
    }

    if (!confirm(`Send verification emails to ${unverifiedCount} unverified users?`)) {
      return;
    }

    try {
      setMessage('');
      setError('');
      const result = await adminService.sendVerificationEmails();
      setMessage(result.message || `Sent ${result.sent_count} verification emails.`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send verification emails');
    }
  };

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setMessage('');
      setError('');
      await adminService.deleteUser(userId);
      setMessage(`User "${userEmail}" deleted successfully.`);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleUpdateConfig = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!config) return;

    try {
      setMessage('');
      setError('');
      const formData = new FormData(e.currentTarget);
      const updatedConfig = await adminService.updateConfig({
        registration_open: formData.get('registration_open') as string,
        registration_close: formData.get('registration_close') as string,
        matching_start_date: formData.get('matching_start_date') as string,
        min_budget: formData.get('min_budget') as string,
        max_budget: formData.get('max_budget') as string,
        allowed_email_domains: (formData.get('allowed_email_domains') as string).split(',').map(d => d.trim()),
        is_active: formData.get('is_active') === 'on',
      });
      setConfig(updatedConfig);
      setMessage(t('admin.config.updateSuccess'));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update configuration');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Mobile Notice */}
      <div className="lg:hidden min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">💻</div>
          <h2 className="text-2xl font-bold text-christmas-red mb-4">{t('admin.mobileNotSupported') || 'Desktop Only'}</h2>
          <p className="text-gray-600 mb-6">
            {t('admin.mobileMessage') || 'The admin panel is optimized for desktop screens. Please access it from a computer or tablet in landscape mode.'}
          </p>
          <div className="text-sm text-gray-500">
            {t('admin.minWidth') || 'Minimum width: 1024px'}
          </div>
        </div>
      </div>

      {/* Desktop Only Content */}
      <div className="hidden lg:block">
        <div className="container mx-auto px-6 py-8 text-slate-900">
          <h1 className="text-3xl font-bold mb-6 text-christmas-red">{t('admin.title')}</h1>

          {message && (
            <div className="bg-green-50/90 border border-green-200 text-green-800 px-4 py-3 rounded mb-4 shadow-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50/90 border border-red-200 text-red-800 px-4 py-3 rounded mb-4 shadow-sm">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {(['dashboard', 'users', 'matches', 'config'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-christmas-red text-christmas-red'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t(`admin.tabs.${tab}`)}
                </button>
              ))}
            </nav>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && stats && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('admin.stats.totalUsers')}</h3>
                  <p className="text-3xl font-bold text-christmas-red">{stats.total_users}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('admin.stats.verifiedUsers')}</h3>
                  <p className="text-3xl font-bold text-green-600">{stats.verified_users}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('admin.stats.completedProfiles')}</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.completed_profiles}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('admin.stats.pendingMatches')}</h3>
                  <p className="text-3xl font-bold text-orange-600">{stats.pending_matches || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('admin.stats.activeMatches')}</h3>
                  <p className="text-3xl font-bold text-purple-600">{stats.active_matches}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('admin.stats.confirmedMeetings')}</h3>
                  <p className="text-3xl font-bold text-yellow-600">{stats.confirmed_meetings}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('admin.stats.giftsExchanged')}</h3>
                  <p className="text-3xl font-bold text-indigo-600">{stats.exchanged_gifts}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">{t('admin.runMatching')}</h2>
                <button
                  onClick={handleRunMatching}
                  className="bg-christmas-red text-white px-6 py-2 rounded hover:bg-red-600"
                >
                  {t('admin.runMatching')}
                </button>
                <p className="text-sm text-gray-600 mt-2">
                  This will create new matches for all eligible participants. Existing matches will be deleted.
                </p>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {users.filter(u => !u.email_verified).length} unverified users
                  </span>
                  <button
                    onClick={handleSendVerificationEmails}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                  >
                    Send Verification Emails
                  </button>
                </div>
                <input
                  type="text"
                  placeholder={t('admin.users.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-bilkent-blue/50 focus:border-bilkent-blue transition"
                />
              </div>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.users.email')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.users.name')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.users.verified')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.users.created')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.first_name} {user.last_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.email_verified ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Yes
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete user"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Matches Tab */}
          {activeTab === 'matches' && (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Matches Management</h2>
                {stats && stats.pending_matches > 0 && (
                  <button
                    onClick={handleDeployMatches}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                  >
                    Deploy All Pending ({stats.pending_matches})
                  </button>
                )}
              </div>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.matches.id')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.matches.userA')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.matches.userB')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.matches.userC')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.matches.status')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.matches.created')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {matches.map((match) => (
                      <tr key={match.id} className={match.status === 'pending' ? 'bg-yellow-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{match.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{match.user_a_email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{match.user_b_email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {match.user_c_email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            match.status === 'active' ? 'bg-green-100 text-green-800' : 
                            match.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {match.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(match.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {match.status === 'pending' && (
                            <button
                              onClick={() => handleEditMatch(match)}
                              className="text-blue-600 hover:text-blue-800 mr-2"
                              title="Edit match"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMatch(match.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete match"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {matches.length === 0 && (
                  <div className="text-center py-8 text-gray-500">{t('admin.matches.noMatches')}</div>
                )}
              </div>

              {/* Edit Match Modal */}
              {editingMatch && editFormData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                    <h3 className="text-xl font-bold mb-4">Edit Match #{editingMatch.id}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">User A</label>
                        <select
                          value={editFormData.user_a}
                          onChange={(e) => setEditFormData({...editFormData, user_a: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-bilkent-blue/40 focus:border-bilkent-blue transition"
                        >
                          {users.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.email} ({user.first_name} {user.last_name})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">User B</label>
                        <select
                          value={editFormData.user_b}
                          onChange={(e) => setEditFormData({...editFormData, user_b: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-bilkent-blue/40 focus:border-bilkent-blue transition"
                        >
                          {users.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.email} ({user.first_name} {user.last_name})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">User C (Optional - for groups of 3)</label>
                        <select
                          value={editFormData.user_c || ''}
                          onChange={(e) => setEditFormData({...editFormData, user_c: e.target.value ? parseInt(e.target.value) : undefined})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-bilkent-blue/40 focus:border-bilkent-blue transition"
                        >
                          <option value="">None</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.email} ({user.first_name} {user.last_name})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveMatch}
                        className="px-4 py-2 bg-christmas-green text-white rounded-md hover:bg-green-600"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Config Tab */}
          {activeTab === 'config' && config && (
            <div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">{t('admin.config.title')}</h2>
                <form onSubmit={handleUpdateConfig}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.config.registrationOpen')}</label>
                      <input
                        type="datetime-local"
                        name="registration_open"
                        defaultValue={config.registration_open ? new Date(config.registration_open).toISOString().slice(0, 16) : ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-bilkent-blue/40 focus:border-bilkent-blue transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.config.registrationClose')}</label>
                      <input
                        type="datetime-local"
                        name="registration_close"
                        defaultValue={config.registration_close ? new Date(config.registration_close).toISOString().slice(0, 16) : ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-bilkent-blue/40 focus:border-bilkent-blue transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.config.matchingStartDate')}</label>
                      <input
                        type="datetime-local"
                        name="matching_start_date"
                        defaultValue={config.matching_start_date ? new Date(config.matching_start_date).toISOString().slice(0, 16) : ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-bilkent-blue/40 focus:border-bilkent-blue transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.config.minBudget')}</label>
                      <input
                        type="number"
                        step="0.01"
                        name="min_budget"
                        defaultValue={config.min_budget || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-bilkent-blue/40 focus:border-bilkent-blue transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.config.maxBudget')}</label>
                      <input
                        type="number"
                        step="0.01"
                        name="max_budget"
                        defaultValue={config.max_budget || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-bilkent-blue/40 focus:border-bilkent-blue transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.config.allowedDomains')}</label>
                      <input
                        type="text"
                        name="allowed_email_domains"
                        defaultValue={config?.allowed_email_domains ? config.allowed_email_domains.join(', ') : ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-bilkent-blue/40 focus:border-bilkent-blue transition"
                        placeholder={t('admin.config.allowedDomainsPlaceholder')}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_active"
                        defaultChecked={config?.is_active || false}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">{t('admin.config.isActive')}</span>
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="bg-christmas-red text-white px-6 py-2 rounded hover:bg-red-600"
                  >
                    {t('common.save')}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Notice */}
      <div className="lg:hidden min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Desktop Only</h2>
          <p className="text-gray-600">
            The admin panel is optimized for desktop viewing. Please access it from a computer or tablet in landscape mode.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
