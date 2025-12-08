'use client';

import dynamic from 'next/dynamic';
import { useMemo, useRef, useCallback } from 'react';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-gray-50 rounded-lg flex items-center justify-center">
      Loading editor...
    </div>
  ),
});

export default function RichTextEditor({ value, onChange }) {
  const quillRef = useRef(null);

  // Custom image handler that uploads to Webflow
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/jpeg,image/png,image/gif,image/webp');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      // Validate file size (max 4MB)
      if (file.size > 4 * 1024 * 1024) {
        alert('Image must be smaller than 4MB');
        return;
      }

      // Get quill editor instance
      const quill = quillRef.current?.getEditor();
      if (!quill) return;

      // Save current cursor position
      const range = quill.getSelection(true);

      // Show uploading placeholder
      quill.insertText(range.index, 'Uploading image...', { italic: true });
      const placeholderLength = 'Uploading image...'.length;

      try {
        // Upload to Webflow via our API
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(text || 'Upload failed');
        }

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        // Remove placeholder
        quill.deleteText(range.index, placeholderLength);

        // Insert the uploaded image
        quill.insertEmbed(range.index, 'image', data.url);

        // Move cursor after the image
        quill.setSelection(range.index + 1);
      } catch (err) {
        // Remove placeholder on error
        quill.deleteText(range.index, placeholderLength);
        alert('Failed to upload image: ' + err.message);
      }
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'code-block'],
          ['link', 'image'],
          [{ align: [] }],
          ['clean'],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler]
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'blockquote',
    'code-block',
    'link',
    'image',
    'align',
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-300">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder="Write your blog post content here..."
      />
    </div>
  );
}
