import { useQuery } from '@tanstack/react-query';
import { Plus, Users, Loader2 } from 'lucide-react';
import { pagesApi } from '@/lib/api';
import { Link } from 'react-router-dom';

interface Page {
  id: string;
  name: string;
  slug: string;
  description?: string;
  avatarUrl?: string;
  category: string;
  followersCount: number;
  _count: {
    followers: number;
    posts: number;
  };
}

const categoryIcons: Record<string, string> = {
  dramatics: '🎭',
  sports: '⚽',
  tech: '💻',
  cultural: '🎨',
  academic: '📚',
  music: '🎵',
  art: '🎨',
  photography: '📷',
  social: '🤝',
  other: '📌',
};

export default function Pages() {
  const { data, isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const response = await pagesApi.getPages();
      return response.data.data;
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Club Pages</h1>
          <p className="text-gray-500 dark:text-gray-400">Discover and follow university clubs</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Create Page
        </button>
      </div>

      {/* Pages grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : data?.pages?.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pages yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Be the first to create a club page!</p>
          <button className="btn-primary">Create Page</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {data?.pages?.map((page: Page) => (
            <Link
              key={page.id}
              to={`/pages/${page.slug}`}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center text-2xl">
                  {page.avatarUrl ? (
                    <img
                      src={page.avatarUrl}
                      alt={page.name}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    categoryIcons[page.category] || '📌'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{page.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{page.category}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                    {page.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{page._count?.followers || 0} followers</span>
                    <span>{page._count?.posts || 0} posts</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
