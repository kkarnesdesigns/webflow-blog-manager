'use client';

import { useState, useEffect, useRef } from 'react';
import 'react-quill/dist/quill.snow.css';

export default function RichTextEditor({ value, onChange }) {
  const [QuillComponent, setQuillComponent] = useState(null);
  const quillRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Dynamically import Quill on client side
  useEffect(() => {
    import('react-quill').then((mod) => {
      setQuillComponent(() => mod.default);
    });
  }, []);

  // Set up custom image handler after Quill is ready
  useEffect(() => {
    if (!isReady || !quillRef.current) return;

    const quill = quillRef.current.getEditor();
    if (!quill) return;

    const toolbar = quill.getModule('toolbar');
    if (toolbar) {
      toolbar.addHandler('image', () => {
        console.log('Image handler triggered');
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/jpeg,image/png,image/gif,image/webp');
        input.click();

        input.onchange = async () => {
          const file = input.files?.[0];
          console.log('File selected:', file?.name, file?.size);
          if (!file) return;

          if (file.size > 4 * 1024 * 1024) {
            alert('Image must be smaller than 4MB');
            return;
          }

          const range = quill.getSelection(true);
          console.log('Cursor position:', range?.index);

          // Insert placeholder
          quill.insertText(range.index, '[Uploading...]', { italic: true, color: '#888' });

          try {
            const formData = new FormData();
            formData.append('file', file);

            console.log('Uploading to /api/upload...');
            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });

            const text = await response.text();
            console.log('Upload response:', text);
            let data;
            try {
              data = JSON.parse(text);
            } catch {
              throw new Error(text || 'Upload failed');
            }

            if (!response.ok) {
              throw new Error(data.error || 'Upload failed');
            }

            console.log('Upload successful, inserting image:', data.url);
            // Remove placeholder and insert image
            quill.deleteText(range.index, '[Uploading...]'.length);
            quill.insertEmbed(range.index, 'image', data.url);
            quill.setSelection(range.index + 1);
          } catch (err) {
            console.error('Upload error:', err);
            quill.deleteText(range.index, '[Uploading...]'.length);
            alert('Failed to upload image: ' + err.message);
          }
        };
      });
    }
  }, [isReady]);

  if (!QuillComponent) {
    return (
      <div className="h-[300px] bg-gray-50 rounded-lg flex items-center justify-center border border-gray-300">
        Loading editor...
      </div>
    );
  }

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      [{ align: [] }],
      ['clean'],
    ],
  };

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
      <QuillComponent
        ref={(el) => {
          quillRef.current = el;
          if (el && !isReady) {
            setIsReady(true);
          }
        }}
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
