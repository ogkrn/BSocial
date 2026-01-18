import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Home,
  Search,
  MessageCircle,
  Users,
  Bell,
  Settings,
  LogOut,
  GraduationCap,
  PlusSquare,
  X,
  Image,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi, postsApi } from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const navItems = [
  { to: '/feed', icon: Home, label: 'Feed' },
  { to: '/messages', icon: MessageCircle, label: 'Messages' },
  { to: '/pages', icon: Users, label: 'Pages' },
];

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (data: { content: string; mediaUrls?: string[] }) =>
      postsApi.createPost(data),
    onSuccess: () => {
      toast.success('Post created!');
      setShowCreatePost(false);
      setPostContent('');
      setPostImages([]);
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: () => {
      toast.error('Failed to create post');
    },
  });

  const handleCreatePost = () => {
    if (!postContent.trim() && postImages.length === 0) {
      toast.error('Please add some content or an image');
      return;
    }
    createPostMutation.mutate({
      content: postContent,
      mediaUrls: postImages.length > 0 ? postImages : undefined,
    });
  };

  const addImageUrl = () => {
    if (imageInput.trim()) {
      setPostImages([...postImages, imageInput.trim()]);
      setImageInput('');
    }
  };

  const removeImage = (index: number) => {
    setPostImages(postImages.filter((_, i) => i !== index));
  };

  useEffect(() => {
    // Restore dark mode preference from localStorage
    const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    if (darkModeEnabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    // Connect socket on mount
    connectSocket();

    return () => {
      disconnectSocket();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      disconnectSocket();
      navigate('/login');
      toast.success('Logged out successfully');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top navbar - Mobile */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-800 border-b dark:border-gray-700 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-7 h-7 text-primary-600" />
          <span className="font-bold text-lg dark:text-white">BSocial</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </header>

      <div className="lg:flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b dark:border-gray-700">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold dark:text-white">BSocial</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
            
            {/* Create Post Button */}
            <button
              onClick={() => setShowCreatePost(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors bg-primary-600 text-white hover:bg-primary-700 mt-4"
            >
              <PlusSquare className="w-5 h-5" />
              Create Post
            </button>
          </nav>

          {/* User section */}
          <div className="p-4 border-t dark:border-gray-700">
            <NavLink
              to={`/profile/${user?.username}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="avatar w-10 h-10 text-sm">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user?.fullName?.charAt(0)?.toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.fullName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user?.username}</p>
              </div>
            </NavLink>

            <div className="flex items-center gap-2 mt-3">
              <NavLink
                to="/settings"
                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Settings className="w-4 h-4" />
                Settings
              </NavLink>
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 pb-16 lg:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Bottom navigation - Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex items-center justify-around z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 ${
                isActive ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'
              }`
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => setShowCreatePost(true)}
          className="flex flex-col items-center gap-1 p-2 text-gray-500 dark:text-gray-400"
        >
          <PlusSquare className="w-6 h-6" />
          <span className="text-xs">Create</span>
        </button>
        <NavLink
          to={`/profile/${user?.username}`}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 ${
              isActive ? 'text-primary-600' : 'text-gray-500'
            }`
          }
        >
          <div className="avatar w-6 h-6 text-xs">
            {user?.fullName?.charAt(0)?.toUpperCase()}
          </div>
          <span className="text-xs">Profile</span>
        </NavLink>
      </nav>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold dark:text-white">Create Post</h2>
              <button
                onClick={() => setShowCreatePost(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="avatar w-10 h-10 text-sm">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    user?.fullName?.charAt(0)?.toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">@{user?.username}</p>
                </div>
              </div>

              {/* Post Content */}
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full min-h-[120px] p-3 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500"
              />

              {/* Image URLs */}
              {postImages.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Images</p>
                  <div className="grid grid-cols-2 gap-2">
                    {postImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Post image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Invalid+URL';
                          }}
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Image URL */}
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Image URL</p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addImageUrl();
                      }
                    }}
                  />
                  <button
                    onClick={addImageUrl}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Image className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowCreatePost(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={createPostMutation.isPending || (!postContent.trim() && postImages.length === 0)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {createPostMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
