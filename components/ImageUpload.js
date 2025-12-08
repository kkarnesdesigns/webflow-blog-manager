'use client';

import { useState, useRef } from 'react';

export default function ImageUpload({ label, value, onChange, helpText }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(value || '');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, GIF, or WebP image.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10MB.');
      return;
    }

    setError('');
    setUploading(true);

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Update with the hosted URL
      const imageUrl = data.url || data.displayUrl;
      setPreview(imageUrl);
      onChange(imageUrl);
    } catch (err) {
      setError(err.message);
      // Revert preview on error
      setPreview(value || '');
    } finally {
      setUploading(false);
      // Clean up object URL
      URL.revokeObjectURL(localPreview);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setPreview(url);
    onChange(url);
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Preview */}
      {preview && (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="max-w-xs max-h-48 rounded-lg border border-gray-200 object-cover"
            onError={() => setError('Failed to load image preview')}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}

      {/* Upload area */}
      <div className="flex items-center gap-3">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          id={`file-${label.replace(/\s+/g, '-').toLowerCase()}`}
        />
        <label
          htmlFor={`file-${label.replace(/\s+/g, '-').toLowerCase()}`}
          className={`px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? 'Uploading...' : preview ? 'Change Image' : 'Upload Image'}
        </label>
        <span className="text-gray-400 text-sm">or</span>
        <input
          type="url"
          value={typeof value === 'string' ? value : ''}
          onChange={handleUrlChange}
          placeholder="Paste image URL"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Help text */}
      {helpText && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
