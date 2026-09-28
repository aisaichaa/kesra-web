import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { readDataPaginated } from '../services/supabaseUtils';
import { stripHTML } from '../lib/htmlUtils';

// Article type (copy from ArticleList)
type Article = {
  id: number;
  title: string;
  content: string;
  created_at?: string;
};

const PAGE_SIZE = 6;

const ArticleAll: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, count } = await readDataPaginated('articles', {
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
          orderBy: 'created_at',
          orderDir: 'desc',
        });
        setArticles(data || []);
        setTotalCount(count || 0);
      } catch (err) {
        setError('Gagal memuat artikel.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [page]);

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
            Semua Artikel
          </h1>
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
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888' }}>Belum ada artikel.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {articles.map((article) => (
              <div key={article.id} style={{
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: 24,
                marginBottom: 8
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: 8 }}>
                  <Link to={`/article/${article.id}`} style={{ color: '#213c88', textDecoration: 'none' }}>{article.title}</Link>
                </h2>
                <div style={{ color: '#888', fontSize: '0.95rem', marginBottom: 8 }}>
                  {article.created_at && new Date(article.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </div>
                <p style={{
                  fontSize: '1rem',
                  color: '#444',
                  marginBottom: 8,
                  lineHeight: 1.6,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {stripHTML(article.content).slice(0, 180)}{stripHTML(article.content).length > 180 ? '...' : ''}
                </p>
                <Link to={`/article/${article.id}`} style={{ color: '#2863a7', fontWeight: 'bold', textDecoration: 'none' }}>
                  Baca Selengkapnya
                </Link>
              </div>
            ))}
          </div>
        )}
        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 32 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              background: '#e5e7eb',
              color: '#222',
              border: 'none',
              borderRadius: 4,
              padding: '6px 16px',
              fontWeight: 500,
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.6 : 1
            }}
          >
            Sebelumnya
          </button>
          <span style={{ fontSize: 15 }}>
            Halaman {page} dari {Math.max(1, Math.ceil(totalCount / PAGE_SIZE))}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(totalCount / PAGE_SIZE)}
            style={{
              background: '#e5e7eb',
              color: '#222',
              border: 'none',
              borderRadius: 4,
              padding: '6px 16px',
              fontWeight: 500,
              cursor: page >= Math.ceil(totalCount / PAGE_SIZE) ? 'not-allowed' : 'pointer',
              opacity: page >= Math.ceil(totalCount / PAGE_SIZE) ? 0.6 : 1
            }}
          >
            Selanjutnya
          </button>
        </div>
      </section>
    </main>
  );
};

export default ArticleAll; 