'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import PostEditor from '@/components/PostEditor';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      if (!data.authenticated) {
        router.push('/');
      }
      setAuthenticated(data.authenticated);
    } catch {
      router.push('/');
    }
  };

  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back
            </Link>
            <h1 className="text-xl font-bold text-gray-800">Edit Blog Post</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <PostEditor postId={id} />
      </main>
    </div>
  );
}
