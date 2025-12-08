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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rr-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-rr-pink/30 text-rr-pink p-4 rounded-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="text-center py-12 text-rr-gray bg-white rounded-xl border border-gray-100">
          No blog posts yet. Create your first one!
        </div>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-rr-navy">
                    {post.fieldData?.name || 'Untitled'}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      post.isDraft
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {post.isDraft ? 'Draft' : 'Published'}
                  </span>
                  {post.fieldData?.featured && (
                    <span className="px-2.5 py-0.5 text-xs font-medium bg-rr-blue/10 text-rr-blue rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-rr-gray text-sm line-clamp-2 mb-2">
                  {post.fieldData?.['post-summary'] || 'No summary'}
                </p>
                <div className="text-xs text-rr-gray-light">
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
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-rr-navy font-medium rounded-lg transition-all duration-200"
                >
                  Edit
                </Link>
                {post.isDraft && (
                  <button
                    onClick={() => handlePublish(post.id)}
                    disabled={publishing === post.id}
                    className="px-4 py-2 text-sm bg-rr-blue hover:bg-rr-navy text-white font-medium rounded-lg disabled:opacity-50 transition-all duration-200"
                  >
                    {publishing === post.id ? '...' : 'Publish'}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(post.id, post.fieldData?.name)}
                  disabled={deleting === post.id}
                  className="px-4 py-2 text-sm bg-rr-pink/10 hover:bg-rr-pink/20 text-rr-pink font-medium rounded-lg disabled:opacity-50 transition-all duration-200"
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
