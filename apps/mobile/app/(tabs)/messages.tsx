import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function Messages() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      <View style={styles.emptyState}>
        <Ionicons name="chatbubbles" size={48} color="#d1d5db" />
        <Text style={styles.emptyText}>No conversations yet</Text>
        <Text style={styles.emptySubtext}>Start a chat with someone!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#6b7280', marginTop: 16 },
  emptySubtext: { color: '#9ca3af', fontSize: 14 },
});
