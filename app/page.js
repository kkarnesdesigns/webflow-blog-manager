'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LoginForm from '@/components/LoginForm';
import PostsList from '@/components/PostsList';

const LOGO_URL = 'https://cdn.prod.website-files.com/64c2c941368dd7094ffd75a5/663e36a7db766a236592729b_Resting%20Rainbow%20Pet%20Memorials%20and%20Cremation%20TL%20FF-01.webp';

export default function Home() {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      setAuthenticated(data.authenticated);
    } catch {
      setAuthenticated(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuthenticated(false);
  };

  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rr-cream">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rr-blue"></div>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginForm onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-rr-cream">
      {/* Header */}
      <header className="bg-rr-navy shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={LOGO_URL}
              alt="Resting Rainbow"
              className="h-12 w-auto"
            />
            <span className="text-white/60 text-sm font-medium hidden sm:block">
              Blog Manager
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/posts/new"
              className="px-5 py-2.5 bg-rr-blue hover:bg-rr-pink text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              + New Post
            </Link>
            <button
              onClick={handleLogout}
              className="text-white/70 hover:text-white transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-heading font-bold text-rr-navy mb-2">
            Blog Posts
          </h2>
          <p className="text-rr-gray">
            Manage your Resting Rainbow of Tampa blog posts. Create, edit, and publish content.
          </p>
        </div>

        <PostsList />
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-rr-gray text-sm">
        <p>Resting Rainbow of Tampa</p>
      </footer>
    </div>
  );
}
