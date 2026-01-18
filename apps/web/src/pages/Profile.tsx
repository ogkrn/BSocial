import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Mail, 
  Calendar, 
  Edit2, 
  Camera,
  GraduationCap,
  Clock,
  Heart,
  MessageCircle,
  Users,
  FileText,
  UserPlus,
  UserMinus,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { usersApi } from '@/lib/api';
import toast from 'react-hot-toast';

type TabType = 'overview' | 'posts' | 'activity' | 'settings';

interface ProfileUser {
  id: string;
  email: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  branch?: string;
  year?: string;
  createdAt: string;
  isFollowing?: boolean;
  isOwnProfile?: boolean;
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
}

export default function Profile() {
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Determine if we're viewing our own profile
  const isOwnProfile = !username || username === currentUser?.username;

  // Fetch profile data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile', username || currentUser?.username],
    queryFn: async () => {
      const usernameToFetch = username || currentUser?.username;
      if (!usernameToFetch) throw new Error('No username');
      const response = await usersApi.getProfile(usernameToFetch);
      return response.data.data as ProfileUser;
    },
    enabled: !!(username || currentUser?.username),
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: (userId: string) => usersApi.follow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
      toast.success('Connected!');
    },
    onError: () => {
      toast.error('Failed to connect');
    },
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: (userId: string) => usersApi.unfollow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
      toast.success('Disconnected');
    },
    onError: () => {
      toast.error('Failed to disconnect');
    },
  });

  // Use fetched profile data or fall back to current user for own profile
  const user = profileData || (isOwnProfile ? currentUser : null);

  const tabs = isOwnProfile 
    ? [
        { id: 'overview', label: 'Overview' },
        { id: 'posts', label: 'Posts' },
        { id: 'activity', label: 'Activity' },
        { id: 'settings', label: 'Settings' },
      ]
    : [
        { id: 'overview', label: 'Overview' },
        { id: 'posts', label: 'Posts' },
      ];

  // Real data - will be populated from API
  const recentActivity: { id: number; action: string; target: string; time: string; avatar: string }[] = [];
  const connections: { id: number; name: string; role: string; avatar: string; date: string }[] = [];

  const stats = [
    { label: 'Posts', value: (user as ProfileUser)?._count?.posts || 0, icon: FileText },
    { label: 'Connections', value: ((user as ProfileUser)?._count?.followers || 0) + ((user as ProfileUser)?._count?.following || 0), icon: Users },
  ];

  const handleConnect = () => {
    if (profileData?.id) {
      if (profileData.isFollowing) {
        unfollowMutation.mutate(profileData.id);
      } else {
        followMutation.mutate(profileData.id);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!user && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">User not found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">The user you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/feed')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              {!isOwnProfile && (
                <button 
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              )}
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {isOwnProfile ? 'Profile' : `@${user?.username}`}
              </h1>
            </div>
            {isOwnProfile && (
              <button 
                onClick={() => navigate('/profile/edit')}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
          
          {/* Tabs */}
          <div className="flex gap-8 border-b border-gray-200 dark:border-gray-700 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Cover Image */}
              <div className="h-24 bg-gradient-to-r from-primary-500 to-purple-600 relative">
                {isOwnProfile && (
                  <button className="absolute bottom-2 right-2 p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
              
              {/* Avatar & Name */}
              <div className="px-6 pb-6">
                <div className="relative -mt-12 mb-4">
                  <div className="w-24 h-24 rounded-full bg-primary-600 border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-lg">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-white text-3xl font-bold">
                        {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  {isOwnProfile && (
                    <button className="absolute bottom-0 right-0 p-1.5 bg-primary-600 rounded-full text-white shadow-lg hover:bg-primary-700 transition-colors">
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.fullName || 'User Name'}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">@{user?.username || 'username'}</p>
                
                {user?.bio && (
                  <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm">{user.bio}</p>
                )}

                {/* Action Buttons - Instagram style (only for other users) */}
                {!isOwnProfile && (
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={handleConnect}
                      disabled={followMutation.isPending || unfollowMutation.isPending}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                        profileData?.isFollowing
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      {followMutation.isPending || unfollowMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : profileData?.isFollowing ? (
                        'Connected'
                      ) : (
                        'Connect'
                      )}
                    </button>
                    <button 
                      onClick={() => navigate('/messages')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Message
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">About</h3>
              
              <div className="space-y-4">
                {isOwnProfile && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-sm text-gray-900 dark:text-white">{user?.email || 'email@example.com'}</p>
                    </div>
                  </div>
                )}

                {user?.branch && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Branch</p>
                      <p className="text-sm text-gray-900 dark:text-white">{user.branch}</p>
                    </div>
                  </div>
                )}

                {user?.year && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Year</p>
                      <p className="text-sm text-gray-900 dark:text-white">{user.year}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Joined</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {user?.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Jan 2026'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-2">
                      <stat.icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'overview' && (
              <>
                {/* Connections Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {isOwnProfile ? 'Recent Connections' : 'Connections'}
                    </h3>
                  </div>
                  {connections.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Branch</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Connected</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {connections.map((connection) => (
                            <tr key={connection.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-medium text-sm">
                                    {connection.avatar}
                                  </div>
                                  <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{connection.name}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{connection.role}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{connection.date}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">•••</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No connections yet</p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                        {isOwnProfile ? 'Start following people to see them here' : 'This user has no connections yet'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Activity & Stats Row - Only for own profile */}
                {isOwnProfile && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Activity Feed */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Activity</h3>
                      </div>
                      {recentActivity.length > 0 ? (
                        <>
                          <div className="space-y-4">
                            {recentActivity.map((activity) => (
                              <div key={activity.id} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm">
                                  {activity.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-900 dark:text-white">
                                    <span className="font-medium">{activity.action}</span>{' '}
                                    <span className="text-gray-600 dark:text-gray-400">{activity.target}</span>
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <button className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
                            View all
                          </button>
                        </>
                      ) : (
                        <div className="text-center py-6">
                          <Clock className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-500 dark:text-gray-400 text-sm">No activity yet</p>
                          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Your recent actions will appear here</p>
                        </div>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Engagement</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                              <Heart className="w-4 h-4 text-red-500" />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">Total Likes</span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">0</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <MessageCircle className="w-4 h-4 text-blue-500" />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">Comments</span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">0</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <Users className="w-4 h-4 text-green-500" />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">Profile Views</span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'posts' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No posts yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {isOwnProfile ? 'Share your first post with the community!' : 'This user hasn\'t posted anything yet.'}
                </p>
                {isOwnProfile && (
                  <button 
                    onClick={() => navigate('/feed')}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Create Post
                  </button>
                )}
              </div>
            )}

            {activeTab === 'activity' && isOwnProfile && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">All Activity</h3>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg">
                          {activity.avatar}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-medium">{activity.action}</span>{' '}
                            <span className="text-gray-600 dark:text-gray-400">{activity.target}</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No activity yet</h3>
                    <p className="text-gray-500 dark:text-gray-400">Start interacting with posts and users to see your activity here</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && isOwnProfile && (
              <div className="space-y-6">
                {/* Account Settings - Email */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Account Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled
                        value={user?.email || 'example@email.com'}
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Email cannot be changed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Notifications</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Email notifications', description: 'Receive email updates' },
                      { label: 'Push notifications', description: 'Browser push notifications' },
                      { label: 'Message sounds', description: 'Play sound for new messages' },
                    ].map((setting, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{setting.label}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 dark:peer-focus:ring-primary-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30 p-6">
                  <h3 className="font-semibold text-red-600 dark:text-red-400 mb-4">Danger Zone</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Once you delete your account, there is no going back.
                  </p>
                  <button className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
