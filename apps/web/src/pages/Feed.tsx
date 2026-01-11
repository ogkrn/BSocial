import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Image, Send, Heart, MessageCircle, MoreHorizontal, Loader2 } from 'lucide-react';
import { postsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  content: string;
  mediaUrls: string[];
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
  };
}

export default function Feed() {
  const [newPost, setNewPost] = useState('');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch feed
  const { data, isLoading } = useQuery({
    queryKey: ['feed'],
    queryFn: async () => {
      const response = await postsApi.getFeed();
      return response.data.data;
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (content: string) => postsApi.createPost({ content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      setNewPost('');
      toast.success('Post created!');
    },
    onError: () => {
      toast.error('Failed to create post');
    },
  });

  // Like/unlike mutation
  const likeMutation = useMutation({
    mutationFn: ({ postId, isLiked }: { postId: string; isLiked: boolean }) =>
      isLiked ? postsApi.unlikePost(postId) : postsApi.likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    createPostMutation.mutate(newPost);
  };

  const handleLike = (postId: string, isLiked: boolean) => {
    likeMutation.mutate({ postId, isLiked });
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Create Post */}
      <div className="card mb-6">
        <form onSubmit={handleSubmitPost}>
          <div className="flex gap-3">
            <div className="avatar w-10 h-10 text-sm flex-shrink-0">
              {user?.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full border-0 resize-none focus:outline-none text-gray-900 placeholder-gray-500"
                rows={3}
              />
              <div className="flex items-center justify-between pt-3 border-t">
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                >
                  <Image className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={!newPost.trim() || createPostMutation.isPending}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  {createPostMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Post
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : data?.posts?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No posts yet. Be the first to post!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.posts?.map((post: Post) => (
            <article key={post.id} className="card">
              {/* Post header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="avatar w-10 h-10 text-sm">
                    {post.user.avatarUrl ? (
                      <img
                        src={post.user.avatarUrl}
                        alt={post.user.fullName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      post.user.fullName?.charAt(0)?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{post.user.fullName}</p>
                    <p className="text-sm text-gray-500">
                      @{post.user.username} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Post content */}
              <p className="text-gray-800 whitespace-pre-wrap mb-4">{post.content}</p>

              {/* Media */}
              {post.mediaUrls?.length > 0 && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img
                    src={post.mediaUrls[0]}
                    alt="Post media"
                    className="w-full object-cover"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-6 pt-3 border-t">
                <button
                  onClick={() => handleLike(post.id, post.isLiked)}
                  className={`flex items-center gap-2 text-sm ${
                    post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                  {post.likesCount > 0 && post.likesCount}
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600">
                  <MessageCircle className="w-5 h-5" />
                  {post.commentsCount > 0 && post.commentsCount}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
