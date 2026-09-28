import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { readData } from '../services/supabaseUtils';

// Article type (copy from ArticleList)
type Article = {
  id: number;
  title: string;
  content: string;
  created_at?: string;
};

const ArticleSingle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await readData('articles', { id: Number(id) });
        if (data && data.length > 0) {
          setArticle(data[0]);
        } else {
          setError('Artikel tidak ditemukan.');
        }
      } catch (err) {
        setError('Gagal memuat artikel.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchArticle();
  }, [id]);

  return (
    <main>
      <section style={{
        position: 'relative',
        background: 'linear-gradient(120deg, #2863a7 0%, #213c88 100%)',
        minHeight: '30vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#fff',
        padding: '0 1rem'
      }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '900px', marginTop: '100px', marginBottom: '20px' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            margin: 0,
            lineHeight: 1.3
          }}>
            {loading ? 'Memuat...' : article ? article.title : 'Artikel Tidak Ditemukan'}
          </h1>
          <p style={{ marginTop: '1rem', fontSize: '1.1rem', fontWeight: 300 }}>
            {article && article.created_at && (
              <span>{new Date(article.created_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}</span>
            )}
          </p>
        </div>
      </section>
      <section style={{
        padding: '2rem',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        background: '#fff',
        borderRadius: 12,
        marginTop: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 16px #0002',
        minHeight: 300
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#888' }}>Memuat artikel...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#e53e3e' }}>{error}</div>
        ) : article ? (
          <>
            <div style={{ fontSize: '1.1rem', color: '#222', lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
            <div style={{ marginTop: 32 }}>
              <Link to="/" style={{ color: '#2863a7', fontWeight: 'bold', textDecoration: 'none' }}>&larr; Kembali ke Beranda</Link>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
};

export default ArticleSingle; 