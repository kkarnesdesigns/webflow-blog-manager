'use client';

import { useState } from 'react';

const LOGO_URL = 'https://cdn.prod.website-files.com/64c2c941368dd7094ffd75a5/663e36a7db766a236592729b_Resting%20Rainbow%20Pet%20Memorials%20and%20Cremation%20TL%20FF-01.webp';

export default function LoginForm({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-rr-cream">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <img
            src={LOGO_URL}
            alt="Resting Rainbow"
            className="h-16 w-auto mb-4"
          />
          <h1 className="text-xl font-heading font-bold text-rr-navy">
            Blog Manager
          </h1>
          <p className="text-rr-gray text-sm mt-1">Sign in to manage your posts</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-rr-navy mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rr-blue focus:border-transparent transition-all duration-200"
              placeholder="Enter password"
              required
            />
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-rr-pink/30 text-rr-pink rounded-lg text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rr-blue text-white py-3 px-4 rounded-lg hover:bg-rr-navy disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
