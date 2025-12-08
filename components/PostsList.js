'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PostsList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch posts');
      }

      setPosts(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (postId) => {
    if (!confirm('Publish this post? It will be live on your website.')) {
      return;
    }

    setPublishing(postId);
    try {
      const response = await fetch(`/api/posts/${postId}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to publish');
      }

      await fetchPosts();
    } catch (err) {
      alert(err.message);
    } finally {
      setPublishing(null);
    }
  };

  const handleDelete = async (postId, postName) => {
    if (!confirm(`Delete "${postName}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(postId);
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete');
      }

      setPosts(posts.filter((p) => p.id !== postId));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No blog posts yet. Create your first one!
        </div>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {post.fieldData?.name || 'Untitled'}
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      post.isDraft
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {post.isDraft ? 'Draft' : 'Published'}
                  </span>
                  {post.fieldData?.featured && (
                    <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                  {post.fieldData?.['post-summary'] || 'No summary'}
                </p>
                <div className="text-xs text-gray-400">
                  Last updated:{' '}
                  {new Date(post.lastUpdated).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Link
                  href={`/posts/${post.id}`}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Edit
                </Link>
                {post.isDraft && (
                  <button
                    onClick={() => handlePublish(post.id)}
                    disabled={publishing === post.id}
                    className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {publishing === post.id ? '...' : 'Publish'}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(post.id, post.fieldData?.name)}
                  disabled={deleting === post.id}
                  className="px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg disabled:opacity-50 transition-colors"
                >
                  {deleting === post.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
