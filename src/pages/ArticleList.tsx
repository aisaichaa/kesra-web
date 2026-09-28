import React, { useEffect, useState } from 'react';
import { readDataPaginated, deleteData } from '../services/supabaseUtils';
import { useNavigate } from 'react-router-dom';

type Article = {
  id: number;
  title: string;
  content: string;
  created_at?: string;
};

const PAGE_SIZE = 10;
const ArticleList: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  const fetchArticles = async (pageNum = 1) => {
    setLoading(true);
    try {
      const { data, count } = await readDataPaginated('articles', {
        limit: PAGE_SIZE,
        offset: (pageNum - 1) * PAGE_SIZE,
        orderBy: 'created_at',
        orderDir: 'desc',
      });
      setArticles(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      alert('Gagal mengambil artikel');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await deleteData('articles', id);
      fetchArticles(page);
    } catch (error) {
      alert('Gagal menghapus artikel');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '2rem auto', padding: 16 }}>
        <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24 }}>Daftar Artikel</h2>
        <p>Memuat...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: 16, paddingTop: 80 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: 28, margin: 0 }}>Daftar Artikel</h2>
        <button
          onClick={() => navigate('create')}
          style={{
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 18px',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 8px #0001'
          }}
        >
          + Artikel Baru
        </button>
      </div>
      <div style={{
        overflowX: 'auto',
        borderRadius: 12,
        boxShadow: '0 2px 16px #0002',
        background: '#fff'
      }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th style={{ padding: 14, textAlign: 'left', fontWeight: 600, fontSize: 15, borderTopLeftRadius: 12 }}>Judul</th>
              <th style={{ padding: 14, textAlign: 'left', fontWeight: 600, fontSize: 15 }}>Tanggal</th>
              <th style={{ padding: 14, textAlign: 'center', fontWeight: 600, fontSize: 15, borderTopRightRadius: 12 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {articles.map(article => (
              <tr key={article.id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background 0.2s' }}>
                <td style={{ padding: 14, fontSize: 15 }}>{article.title}</td>
                <td style={{ padding: 14, fontSize: 15 }}>{article.created_at && new Date(article.created_at).toLocaleString('id-ID', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</td>
                <td style={{ padding: 14, textAlign: 'center' }}>
                  <button
                    onClick={() => navigate(`edit/${article.id}`)}
                    style={{
                      background: '#fbbf24',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      padding: '6px 14px',
                      fontWeight: 500,
                      marginRight: 8,
                      cursor: 'pointer'
                    }}
                  >
                    Edit Artikel
                  </button>
                  <button
                    onClick={() => handleDelete(article.id)}
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      padding: '6px 14px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                  Tidak ada artikel.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 24 }}>
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
    </div>
  );
};

export default ArticleList; 