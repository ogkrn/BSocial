import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Shield, User, Moon } from 'lucide-react';

export default function Settings() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>
      
      <div className="space-y-4">
        {/* General Settings */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">General Settings</h2>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 dark:text-white">App Preferences</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
            
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Switch to dark theme</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 dark:peer-focus:ring-primary-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Privacy & Security</h2>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 dark:text-white">Privacy Settings</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 dark:text-white">Security Options</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Profile</h2>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 dark:text-white">Edit Profile</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
