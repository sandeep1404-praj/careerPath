import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from '../utils/toast';
import { User, Mail, Target, Bell, BellOff, Save, Settings } from 'lucide-react';

const SettingsPage = () => {
  const [user, setUser] = useState({ name: '', email: '', track: '', notificationEnabled: true });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch user profile (authenticated)
    authAPI.getProfile()
      .then(res => setUser(res.user || res))
      .catch(() => toast.error('Failed to load user info'));
  }, []);

  const handleChange = e => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleToggle = () => {
    setUser({ ...user, notificationEnabled: !user.notificationEnabled });
  };

  const handleSave = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      // Save profile
      await authAPI.updateProfile(user);
      // Save notification toggle
      await authAPI.updateNotification(user._id, user.notificationEnabled);
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save settings');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
          <Settings className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Account Settings
          </h2>
          <p className="text-sm sm:text-base text-gray-400 mt-1">
            Manage your profile and notification preferences
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 sm:space-y-8">
        {/* Profile Information Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700 shadow-xl">
          <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center mb-4 sm:mb-6">
            <div className="p-1.5 bg-blue-500/20 rounded-lg mr-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
            Profile Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Name Field */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-300">
                Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input 
                  type="text"
                  name="name" 
                  value={user.name} 
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-gray-700/70"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2 md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-300">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input 
                  type="email"
                  name="email" 
                  value={user.email} 
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-gray-700/70"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Track Field */}
            <div className="space-y-2 md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-300">
                Career Track
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Target className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input 
                  type="text"
                  name="track" 
                  value={user.track} 
                  onChange={handleChange} 
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-gray-700/70"
                  placeholder="e.g., Full Stack Developer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700 shadow-xl">
          <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center mb-4 sm:mb-6">
            <div className="p-1.5 bg-purple-500/20 rounded-lg mr-2">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
            Notification Preferences
          </h3>
          
          <div className="bg-gradient-to-br from-gray-700/30 to-gray-700/50 rounded-xl p-4 sm:p-5 border border-gray-600 hover:border-gray-500 transition-all">
            <label className="flex flex-col sm:flex-row sm:items-start cursor-pointer group">
              <div className="flex items-center mb-3 sm:mb-0">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={user.notificationEnabled} 
                    onChange={handleToggle}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-7 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-purple-600"></div>
                </div>
              </div>
              <div className="sm:ml-4 flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  {user.notificationEnabled ? (
                    <div className="p-1 bg-blue-500/20 rounded">
                      <Bell className="w-4 h-4 text-blue-400" />
                    </div>
                  ) : (
                    <div className="p-1 bg-gray-600/20 rounded">
                      <BellOff className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                  <span className="text-sm sm:text-base font-semibold text-white">
                    Motivational Email Notifications
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  {user.notificationEnabled 
                    ? '✓ You will receive motivational emails to help you stay on track with your tasks and roadmap progress.'
                    : '✕ Email notifications are currently disabled. Enable them to receive motivational reminders.'}
                </p>
              </div>
            </label>
          </div>

          {/* Additional Info */}
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-300 flex items-start">
              <Mail className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                Emails are sent based on task deadlines and milestones to keep you motivated and focused.
              </span>
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-gray-700">
          <p className="text-xs sm:text-sm text-gray-400 flex items-center">
            <span className="hidden sm:inline">All changes will be saved to your profile</span>
            <span className="sm:hidden">Changes will be saved to your profile</span>
          </p>
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 active:scale-95"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
