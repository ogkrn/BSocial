import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { LinearGradient } from 'expo-linear-gradient';

type TabType = 'overview' | 'posts' | 'activity' | 'settings';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/welcome');
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'posts', label: 'Posts' },
    { id: 'activity', label: 'Activity' },
    { id: 'settings', label: 'Settings' },
  ];

  // Real data - will be populated from API
  const recentActivity: { id: number; action: string; target: string; time: string; icon: string }[] = [];
  const connections: { id: number; name: string; branch: string; initial: string }[] = [];

  const settingsItems = [
    { icon: 'settings-outline', label: 'General Settings' },
    { icon: 'shield-outline', label: 'Privacy & Security' },
    { icon: 'person-outline', label: 'Edit Profile' },
    { icon: 'notifications-outline', label: 'Notifications' },
    { icon: 'help-circle-outline', label: 'Help & Support' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.editProfileBtn}>
            <Ionicons name="create-outline" size={16} color="white" />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.coverImage}
          >
            <TouchableOpacity style={styles.coverCameraBtn}>
              <Ionicons name="camera" size={14} color="white" />
            </TouchableOpacity>
          </LinearGradient>
          
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <TouchableOpacity style={styles.avatarCameraBtn}>
              <Ionicons name="camera" size={12} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={styles.fullName}>{user?.fullName || 'User Name'}</Text>
          <Text style={styles.username}>@{user?.username || 'username'}</Text>
          
          {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}
        </View>

        {/* About Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ABOUT</Text>
          
          <View style={styles.aboutItem}>
            <View style={styles.aboutIconContainer}>
              <Ionicons name="mail-outline" size={16} color="#6b7280" />
            </View>
            <View>
              <Text style={styles.aboutLabel}>Email</Text>
              <Text style={styles.aboutValue}>{user?.email || 'email@example.com'}</Text>
            </View>
          </View>

          {user?.branch && (
            <View style={styles.aboutItem}>
              <View style={styles.aboutIconContainer}>
                <Ionicons name="school-outline" size={16} color="#6b7280" />
              </View>
              <View>
                <Text style={styles.aboutLabel}>Branch</Text>
                <Text style={styles.aboutValue}>{user.branch}</Text>
              </View>
            </View>
          )}

          {user?.year && (
            <View style={styles.aboutItem}>
              <View style={styles.aboutIconContainer}>
                <Ionicons name="calendar-outline" size={16} color="#6b7280" />
              </View>
              <View>
                <Text style={styles.aboutLabel}>Year</Text>
                <Text style={styles.aboutValue}>{user.year}</Text>
              </View>
            </View>
          )}

          <View style={styles.aboutItem}>
            <View style={styles.aboutIconContainer}>
              <Ionicons name="time-outline" size={16} color="#6b7280" />
            </View>
            <View>
              <Text style={styles.aboutLabel}>Joined</Text>
              <Text style={styles.aboutValue}>
                {user?.createdAt 
                  ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Jan 2026'}
              </Text>
            </View>
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>STATISTICS</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#eef2ff' }]}>
                <Ionicons name="document-text-outline" size={20} color="#667eea" />
              </View>
              <Text style={styles.statNumber}>{user?._count?.posts || 0}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#fef2f2' }]}>
                <Ionicons name="people-outline" size={20} color="#ef4444" />
              </View>
              <Text style={styles.statNumber}>{user?._count?.followers || 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#f0fdf4' }]}>
                <Ionicons name="heart-outline" size={20} color="#22c55e" />
              </View>
              <Text style={styles.statNumber}>{user?._count?.following || 0}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>

        {activeTab === 'overview' && (
          <>
            {/* Recent Connections */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>RECENT CONNECTIONS</Text>
                <TouchableOpacity>
                  <Text style={styles.addButton}>+ Add</Text>
                </TouchableOpacity>
              </View>
              {connections.length > 0 ? (
                connections.map((connection) => (
                  <View key={connection.id} style={styles.connectionItem}>
                    <View style={styles.connectionAvatar}>
                      <Text style={styles.connectionInitial}>{connection.initial}</Text>
                    </View>
                    <View style={styles.connectionInfo}>
                      <Text style={styles.connectionName}>{connection.name}</Text>
                      <Text style={styles.connectionBranch}>{connection.branch}</Text>
                    </View>
                    <TouchableOpacity>
                      <Ionicons name="ellipsis-horizontal" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={40} color="#d1d5db" />
                  <Text style={styles.emptyStateTitle}>No connections yet</Text>
                  <Text style={styles.emptyStateSubtitle}>Start following people to see them here</Text>
                </View>
              )}
            </View>

            {/* Activity */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>ACTIVITY</Text>
              {recentActivity.length > 0 ? (
                <>
                  {recentActivity.map((activity) => (
                    <View key={activity.id} style={styles.activityItem}>
                      <View style={styles.activityIconContainer}>
                        <Ionicons name={activity.icon as any} size={16} color="#6b7280" />
                      </View>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityText}>
                          <Text style={styles.activityAction}>{activity.action}</Text>
                          {' '}{activity.target}
                        </Text>
                        <Text style={styles.activityTime}>{activity.time}</Text>
                      </View>
                    </View>
                  ))}
                  <TouchableOpacity style={styles.viewAllButton}>
                    <Text style={styles.viewAllText}>View all</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="time-outline" size={40} color="#d1d5db" />
                  <Text style={styles.emptyStateTitle}>No activity yet</Text>
                  <Text style={styles.emptyStateSubtitle}>Your recent actions will appear here</Text>
                </View>
              )}
            </View>

            {/* Engagement */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>ENGAGEMENT</Text>
              <View style={styles.engagementItem}>
                <View style={styles.engagementLeft}>
                  <View style={[styles.engagementIcon, { backgroundColor: '#fef2f2' }]}>
                    <Ionicons name="heart" size={16} color="#ef4444" />
                  </View>
                  <Text style={styles.engagementLabel}>Total Likes</Text>
                </View>
                <Text style={styles.engagementValue}>0</Text>
              </View>
              <View style={styles.engagementItem}>
                <View style={styles.engagementLeft}>
                  <View style={[styles.engagementIcon, { backgroundColor: '#eff6ff' }]}>
                    <Ionicons name="chatbubble" size={16} color="#3b82f6" />
                  </View>
                  <Text style={styles.engagementLabel}>Comments</Text>
                </View>
                <Text style={styles.engagementValue}>0</Text>
              </View>
              <View style={styles.engagementItem}>
                <View style={styles.engagementLeft}>
                  <View style={[styles.engagementIcon, { backgroundColor: '#f0fdf4' }]}>
                    <Ionicons name="eye" size={16} color="#22c55e" />
                  </View>
                  <Text style={styles.engagementLabel}>Profile Views</Text>
                </View>
                <Text style={styles.engagementValue}>0</Text>
              </View>
            </View>
          </>
        )}

        {activeTab === 'posts' && (
          <View style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySubtitle}>Share your first post with the community!</Text>
            <TouchableOpacity style={styles.createButton}>
              <Text style={styles.createButtonText}>Create Post</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'activity' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>ALL ACTIVITY</Text>
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                  <View style={styles.activityIconContainer}>
                    <Ionicons name={activity.icon as any} size={16} color="#6b7280" />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityText}>
                      <Text style={styles.activityAction}>{activity.action}</Text>
                      {' '}{activity.target}
                    </Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyStateCenter}>
                <Ionicons name="time-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyStateTitle}>No activity yet</Text>
                <Text style={styles.emptyStateSubtitle}>Start interacting with posts and users to see your activity here</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'settings' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>ACCOUNT SETTINGS</Text>
            {settingsItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.settingsItem}>
                <Ionicons name={item.icon as any} size={22} color="#6b7280" />
                <Text style={styles.settingsLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { 
    backgroundColor: 'white', 
    paddingHorizontal: 16, 
    paddingVertical: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  editProfileText: { color: 'white', fontWeight: '600', fontSize: 14 },
  tabsContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#667eea' },
  tabText: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  tabTextActive: { color: '#667eea' },
  profileCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  coverImage: { height: 80, justifyContent: 'flex-end', alignItems: 'flex-end', padding: 8 },
  coverCameraBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 6,
  },
  avatarContainer: { alignItems: 'center', marginTop: -40 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  avatarText: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  avatarCameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 4,
  },
  fullName: { fontSize: 20, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginTop: 12 },
  username: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  bio: { fontSize: 14, color: '#4b5563', textAlign: 'center', paddingHorizontal: 24, marginTop: 8, paddingBottom: 16 },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: { fontSize: 12, fontWeight: '600', color: '#6b7280', letterSpacing: 0.5, marginBottom: 16 },
  addButton: { color: '#667eea', fontWeight: '600', fontSize: 14 },
  aboutItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  aboutIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutLabel: { fontSize: 11, color: '#9ca3af' },
  aboutValue: { fontSize: 14, color: '#111827' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6b7280' },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  connectionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionInitial: { color: '#667eea', fontWeight: '600', fontSize: 16 },
  connectionInfo: { flex: 1, marginLeft: 12 },
  connectionName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  connectionBranch: { fontSize: 12, color: '#6b7280' },
  activityItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  activityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: { flex: 1 },
  activityText: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
  activityAction: { fontWeight: '600', color: '#111827' },
  activityTime: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  viewAllButton: { alignItems: 'center', marginTop: 8 },
  viewAllText: { color: '#667eea', fontWeight: '600', fontSize: 14 },
  engagementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  engagementLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  engagementIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  engagementLabel: { fontSize: 14, color: '#4b5563' },
  engagementValue: { fontSize: 16, fontWeight: '600', color: '#111827' },
  emptyCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#6b7280', marginTop: 8, textAlign: 'center' },
  createButton: {
    marginTop: 16,
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: { color: 'white', fontWeight: '600' },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  settingsLabel: { flex: 1, fontSize: 16, color: '#111827' },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: { color: '#ef4444', fontWeight: '600', fontSize: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 24 },
  emptyStateCenter: { alignItems: 'center', paddingVertical: 40 },
  emptyStateTitle: { fontSize: 16, fontWeight: '600', color: '#6b7280', marginTop: 12 },
  emptyStateSubtitle: { fontSize: 13, color: '#9ca3af', marginTop: 4, textAlign: 'center', paddingHorizontal: 20 },
});
