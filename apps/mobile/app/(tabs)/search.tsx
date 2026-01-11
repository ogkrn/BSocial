import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function Search() {
  const [query, setQuery] = useState('');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search users, posts, pages..."
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      <View style={styles.emptyState}>
        <Ionicons name="search" size={48} color="#d1d5db" />
        <Text style={styles.emptyText}>Search for users and posts</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  input: { flex: 1, marginLeft: 12, color: '#374151', fontSize: 16 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#6b7280', marginTop: 16 },
});
