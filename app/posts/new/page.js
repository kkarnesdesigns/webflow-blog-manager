'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PostEditor from '@/components/PostEditor';

export default function NewPostPage() {
  const router = useRouter();
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
      <div className="min-h-screen flex items-center justify-center bg-rr-cream">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rr-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rr-cream">
      {/* Header */}
      <header className="bg-rr-navy shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-white/70 hover:text-white transition-colors font-medium"
            >
              ← Back
            </Link>
            <h1 className="text-xl font-heading font-bold text-white">New Blog Post</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <PostEditor />
        </div>
      </main>
    </div>
  );
}
