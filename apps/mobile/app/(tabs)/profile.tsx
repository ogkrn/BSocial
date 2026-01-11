import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';

export default function Profile() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/welcome');
  };

  const menuItems = [
    { icon: 'bookmark-outline', label: 'Saved Posts' },
    { icon: 'heart-outline', label: 'Liked Posts' },
    { icon: 'settings-outline', label: 'Settings' },
    { icon: 'help-circle-outline', label: 'Help & Support' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.fullName?.charAt(0)?.toUpperCase()}</Text>
          </View>
          <Text style={styles.fullName}>{user?.fullName}</Text>
          <Text style={styles.username}>@{user?.username}</Text>
          {user?.branch && (
            <View style={styles.branchRow}>
              <Ionicons name="school-outline" size={16} color="#6b7280" />
              <Text style={styles.branchText}>{user.branch}</Text>
              {user?.year && <Text style={styles.branchText}> • {user.year}</Text>}
            </View>
          )}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <Ionicons name={item.icon as any} size={24} color="#333" />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  profileSection: { backgroundColor: 'white', padding: 24, alignItems: 'center' },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#667eea', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontSize: 32, fontWeight: 'bold' },
  fullName: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginTop: 16 },
  username: { color: '#6b7280' },
  branchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  branchText: { color: '#6b7280', marginLeft: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 32 },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  statLabel: { color: '#6b7280' },
  editButton: { marginTop: 24, borderWidth: 1, borderColor: '#d1d5db', paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20 },
  editButtonText: { fontWeight: '600', color: '#374151' },
  menuSection: { marginTop: 16, backgroundColor: 'white' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  menuLabel: { flex: 1, marginLeft: 12, color: '#111827' },
  logoutButton: { marginTop: 16, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  logoutText: { marginLeft: 8, color: '#ef4444', fontWeight: '600' },
});
