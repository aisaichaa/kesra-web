import React, { useEffect, useState } from 'react';
import { SimpleEditor } from '../components/tiptap-templates/simple/simple-editor';

type ArticleFormProps = {
  initialTitle?: string;
  initialContent?: string;
  onSubmit: (data: { title: string; content: string }) => void;
  submitLabel: string;
  loading?: boolean;
  onCancel?: () => void;
};

const ArticleForm: React.FC<ArticleFormProps> = ({
  initialTitle = '',
  initialContent = '',
  onSubmit,
  submitLabel,
  loading = false,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    // Tidak perlu setContent ke editor manual, SimpleEditor handle sendiri
  }, [initialTitle, initialContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, content });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 2px 16px #0002',
        padding: '2.5rem 2rem',
        maxWidth: 600,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label htmlFor="title" style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
          Judul Artikel
        </label>
        <input
          id="title"
          type="text"
          placeholder="Masukkan judul artikel"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '12px 14px',
            fontSize: 16,
            border: '1px solid #d1d5db',
            borderRadius: 8,
            outline: 'none',
            transition: 'border 0.2s',
            marginBottom: 0,
          }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label htmlFor="content" style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
          Konten Artikel
        </label>
        <SimpleEditor value={content} onChange={setContent} />
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? '#a5b4fc' : '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '12px 28px',
            fontWeight: 700,
            fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px #0001',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => {
            if (!loading) e.currentTarget.style.background = '#1d4ed8';
          }}
          onMouseLeave={e => {
            if (!loading) e.currentTarget.style.background = '#2563eb';
          }}
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: '#e5e7eb',
              color: '#222',
              border: 'none',
              borderRadius: 8,
              padding: '12px 24px',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#d1d5db';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#e5e7eb';
            }}
          >
            Batal
          </button>
        )}
      </div>
    </form>
  );
};

export default ArticleForm; 