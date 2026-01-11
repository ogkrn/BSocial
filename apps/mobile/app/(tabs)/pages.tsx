import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../src/lib/api';

const categoryIcons: Record<string, string> = {
  dramatics: '🎭',
  sports: '⚽',
  tech: '💻',
  cultural: '🎨',
  academic: '📚',
  music: '🎵',
};

export default function Pages() {
  const { data } = useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const response = await api.get('/pages');
      return response.data.data;
    },
  });

  const renderPage = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.pageCard}>
      <View style={styles.pageIcon}>
        <Text style={styles.pageEmoji}>{categoryIcons[item.category] || '📌'}</Text>
      </View>
      <View style={styles.pageInfo}>
        <Text style={styles.pageName}>{item.name}</Text>
        <Text style={styles.pageCategory}>{item.category}</Text>
        <Text style={styles.pageFollowers}>{item._count?.followers || 0} followers</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Club Pages</Text>
        <TouchableOpacity style={styles.createButton}>
          <Ionicons name="add" size={18} color="white" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={data?.pages || []}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No pages yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  createButton: { backgroundColor: '#667eea', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  createButtonText: { color: 'white', fontWeight: '600', marginLeft: 4 },
  pageCard: { backgroundColor: 'white', padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  pageIcon: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#e0e7ff', alignItems: 'center', justifyContent: 'center' },
  pageEmoji: { fontSize: 24 },
  pageInfo: { flex: 1, marginLeft: 12 },
  pageName: { fontWeight: '600', color: '#111827' },
  pageCategory: { color: '#6b7280', fontSize: 14, textTransform: 'capitalize' },
  pageFollowers: { color: '#9ca3af', fontSize: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { color: '#6b7280', marginTop: 16 },
});
