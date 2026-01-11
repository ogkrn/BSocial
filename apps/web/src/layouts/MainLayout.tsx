import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {
  Home,
  Search,
  MessageCircle,
  Users,
  Bell,
  Settings,
  LogOut,
  GraduationCap,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/feed', icon: Home, label: 'Feed' },
  { to: '/messages', icon: MessageCircle, label: 'Messages' },
  { to: '/pages', icon: Users, label: 'Pages' },
];

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gray-50">
      {/* Top navbar - Mobile */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-7 h-7 text-primary-600" />
          <span className="font-bold text-lg">BSocial</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      <div className="lg:flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold">BSocial</span>
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
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t">
            <NavLink
              to={`/profile/${user?.username}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
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
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.fullName}
                </p>
                <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
              </div>
            </NavLink>

            <div className="flex items-center gap-2 mt-3">
              <NavLink
                to="/settings"
                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Settings className="w-4 h-4" />
                Settings
              </NavLink>
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 ${
                isActive ? 'text-primary-600' : 'text-gray-500'
              }`
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
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
    </div>
  );
}
