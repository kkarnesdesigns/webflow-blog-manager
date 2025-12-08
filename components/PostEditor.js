'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from './RichTextEditor';
import ImageUpload from './ImageUpload';

export default function PostEditor({ postId = null }) {
  const router = useRouter();
  const isNew = !postId;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    'post-summary': '',
    'rich-text': '',
    'alt-text': '',
    'author-name': '',
    featured: false,
    location: '',
    category: '',
  });

  // Store image data separately (fileId and url)
  const [images, setImages] = useState({
    'main-image-2': { fileId: '', url: '' },
    'thumbnail-image': { fileId: '', url: '' },
    'author-image': { fileId: '', url: '' },
  });

  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [isDraft, setIsDraft] = useState(true);

  useEffect(() => {
    fetchReferenceData();
    if (!isNew) {
      fetchPost();
    }
  }, [postId]);

  const fetchReferenceData = async () => {
    try {
      const [locRes, catRes] = await Promise.all([
        fetch('/api/locations'),
        fetch('/api/categories'),
      ]);

      const locData = await locRes.json();
      const catData = await catRes.json();

      setLocations(locData.items || []);
      setCategories(catData.items || []);
    } catch (err) {
      console.error('Error fetching reference data:', err);
    }
  };

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch post');
      }

      setIsDraft(data.isDraft);
      setFormData({
        name: data.fieldData?.name || '',
        slug: data.fieldData?.slug || '',
        'post-summary': data.fieldData?.['post-summary'] || '',
        'rich-text': data.fieldData?.['rich-text'] || '',
        'alt-text': data.fieldData?.['alt-text'] || '',
        'author-name': data.fieldData?.['author-name'] || '',
        featured: data.fieldData?.featured || false,
        location: data.fieldData?.location || '',
        category: data.fieldData?.category || '',
      });

      // Load existing images
      setImages({
        'main-image-2': {
          fileId: data.fieldData?.['main-image-2']?.fileId || '',
          url: data.fieldData?.['main-image-2']?.url || '',
        },
        'thumbnail-image': {
          fileId: data.fieldData?.['thumbnail-image']?.fileId || '',
          url: data.fieldData?.['thumbnail-image']?.url || '',
        },
        'author-image': {
          fileId: data.fieldData?.['author-image']?.fileId || '',
          url: data.fieldData?.['author-image']?.url || '',
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: isNew ? generateSlug(name) : prev.slug,
    }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (field, imageData) => {
    setImages((prev) => ({
      ...prev,
      [field]: imageData,
    }));
  };

  // Check for and remove base64/blob images from rich text (pasted images that weren't uploaded)
  const sanitizeRichText = (html) => {
    if (!html) return { html, hadInvalidImages: false };

    const hasBase64 = /src=["']data:image\//i.test(html);
    const hasBlob = /src=["']blob:/i.test(html);

    if (!hasBase64 && !hasBlob) {
      return { html, hadInvalidImages: false };
    }

    // Remove base64 images (data:image/...)
    let sanitized = html.replace(/<img[^>]+src=["']data:image\/[^"']+["'][^>]*>/gi, '');
    // Remove images with blob URLs
    sanitized = sanitized.replace(/<img[^>]+src=["']blob:[^"']+["'][^>]*>/gi, '');

    return { html: sanitized, hadInvalidImages: true };
  };

  const handleSave = async (asDraft = true) => {
    setError('');
    setSaving(true);

    try {
      const payload = { ...formData };

      // Sanitize rich text to remove pasted images that weren't uploaded
      if (payload['rich-text']) {
        const { html, hadInvalidImages } = sanitizeRichText(payload['rich-text']);
        payload['rich-text'] = html;

        if (hadInvalidImages) {
          alert('Some pasted images were removed. Please use the image button in the toolbar to upload images.');
        }
      }

      // Remove empty reference fields
      if (!payload.location) delete payload.location;
      if (!payload.category) delete payload.category;

      // Add image fields if they have fileIds
      if (images['main-image-2'].fileId) {
        payload['main-image-2'] = {
          fileId: images['main-image-2'].fileId,
          url: images['main-image-2'].url,
        };
      }
      if (images['thumbnail-image'].fileId) {
        payload['thumbnail-image'] = {
          fileId: images['thumbnail-image'].fileId,
          url: images['thumbnail-image'].url,
        };
      }
      if (images['author-image'].fileId) {
        payload['author-image'] = {
          fileId: images['author-image'].fileId,
          url: images['author-image'].url,
        };
      }

      const url = isNew ? '/api/posts' : `/api/posts/${postId}`;
      const method = isNew ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          isDraft: asDraft,
          isLive: !asDraft,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save post');
      }

      if (isNew) {
        router.push(`/posts/${data.id}`);
      } else {
        setIsDraft(asDraft);
      }

      alert(asDraft ? 'Saved as draft!' : 'Saved and published!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('Publish this post? It will be live on your website.')) {
      return;
    }

    setPublishing(true);
    try {
      // First save
      await handleSave(false);

      // Then publish
      const response = await fetch(`/api/posts/${postId}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to publish');
      }

      setIsDraft(false);
      alert('Post published successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Title and Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Post Title *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={handleNameChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter post title"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL Slug *
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="url-friendly-slug"
            required
          />
        </div>
      </div>

      {/* Summary */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Post Summary
        </label>
        <textarea
          value={formData['post-summary']}
          onChange={(e) => handleChange('post-summary', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Brief summary that appears on the blog grid..."
        />
      </div>

      {/* Rich Text Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Post Body
        </label>
        <RichTextEditor
          value={formData['rich-text']}
          onChange={(value) => handleChange('rich-text', value)}
        />
      </div>

      {/* Author and Alt Text */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Author Name
          </label>
          <input
            type="text"
            value={formData['author-name']}
            onChange={(e) => handleChange('author-name', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Author name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image Alt Text
          </label>
          <input
            type="text"
            value={formData['alt-text']}
            onChange={(e) => handleChange('alt-text', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Description for main image"
          />
        </div>
      </div>

      {/* Location and Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <select
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select location...</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.fieldData?.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.fieldData?.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Featured Toggle */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="featured"
          checked={formData.featured}
          onChange={(e) => handleChange('featured', e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="featured" className="text-sm font-medium text-gray-700">
          Featured Post
        </label>
      </div>

      {/* Image Uploads */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700">Images</h3>

        <ImageUpload
          label="Main Image"
          value={images['main-image-2']}
          onChange={(data) => handleImageChange('main-image-2', data)}
          helpText="The main featured image for the blog post"
        />

        <ImageUpload
          label="Thumbnail Image"
          value={images['thumbnail-image']}
          onChange={(data) => handleImageChange('thumbnail-image', data)}
          helpText="Smaller version shown on the blog grid"
        />

        <ImageUpload
          label="Author Image"
          value={images['author-image']}
          onChange={(data) => handleImageChange('author-image', data)}
          helpText="Photo of the post author"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving || !formData.name || !formData.slug}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save as Draft'}
        </button>
        {!isNew && (
          <button
            onClick={handlePublish}
            disabled={publishing || saving || !formData.name || !formData.slug}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors"
          >
            {publishing ? 'Publishing...' : isDraft ? 'Save & Publish' : 'Update Live Post'}
          </button>
        )}
      </div>
    </div>
  );
}
