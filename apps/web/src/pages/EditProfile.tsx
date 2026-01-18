import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usersApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [branch, setBranch] = useState(user?.branch || '');
  const [year, setYear] = useState(user?.year || '');
  const [isLoading, setIsLoading] = useState(false);

  const MAX_BIO_LENGTH = 150;

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setBio(user.bio || '');
      setBranch(user.branch || '');
      setYear(user.year || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await usersApi.updateProfile({
        fullName,
        bio,
        branch,
        year,
      });

      if (response.data.success) {
        setUser(response.data.data);
        toast.success('Profile updated successfully!');
        navigate(`/profile/${user?.username}`);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Edit profile</h1>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{user?.username}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">{user?.fullName}</p>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Change photo
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Bio */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Bio
            </label>
            <div className="relative">
              <textarea
                value={bio}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_BIO_LENGTH) {
                    setBio(e.target.value);
                  }
                }}
                placeholder="Write something about yourself..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
              <span className="absolute bottom-3 right-3 text-xs text-gray-400">
                {bio.length} / {MAX_BIO_LENGTH}
              </span>
            </div>
          </div>

          {/* Branch */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Branch
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Branch</option>
              <option value="Computer Science (CSE)">Computer Science (CSE)</option>
              <option value="Electronics (ECE)">Electronics (ECE)</option>
              <option value="Mechanical (ME)">Mechanical (ME)</option>
              <option value="Civil (CE)">Civil (CE)</option>
              <option value="Electrical (EE)">Electrical (EE)</option>
              <option value="Information Technology (IT)">Information Technology (IT)</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Year */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Alumni">Alumni</option>
            </select>
          </div>
        </form>
      </div>
    </div>
  );
}
