import { View, Text, FlatList, RefreshControl, TouchableOpacity, TextInput, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../src/lib/api';

export default function Feed() {
  const [newPost, setNewPost] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ['feed'],
    queryFn: async () => {
      const response = await api.get('/posts/feed');
      return response.data.data;
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderPost = ({ item }: { item: any }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.user.fullName?.charAt(0)?.toUpperCase()}</Text>
        </View>
        <View style={styles.postUserInfo}>
          <Text style={styles.userName}>{item.user.fullName}</Text>
          <Text style={styles.userHandle}>@{item.user.username}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name={item.isLiked ? "heart" : "heart-outline"} size={22} color={item.isLiked ? "#ef4444" : "#6b7280"} />
          <Text style={styles.actionText}>{item.likesCount || ''}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
          <Text style={styles.actionText}>{item.commentsCount || ''}</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BSocial</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <View style={styles.createPost}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color="white" />
        </View>
        <TextInput value={newPost} onChangeText={setNewPost} placeholder="What's on your mind?" style={styles.postInput} placeholderTextColor="#9ca3af" />
        <TouchableOpacity style={styles.postButton}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={data?.posts || []}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<View style={styles.emptyState}><Text style={styles.emptyText}>No posts yet</Text></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  createPost: { backgroundColor: 'white', padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#667eea', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontWeight: 'bold' },
  postInput: { flex: 1, marginLeft: 12, color: '#374151', fontSize: 16 },
  postButton: { backgroundColor: '#667eea', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  postButtonText: { color: 'white', fontWeight: '600' },
  postCard: { backgroundColor: 'white', padding: 16, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  postUserInfo: { marginLeft: 12, flex: 1 },
  userName: { fontWeight: '600', color: '#111827' },
  userHandle: { color: '#6b7280', fontSize: 14 },
  postContent: { color: '#1f2937', marginBottom: 12 },
  postActions: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  actionButton: { flexDirection: 'row', alignItems: 'center' },
  actionText: { marginLeft: 4, color: '#6b7280' },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { color: '#6b7280' },
});
