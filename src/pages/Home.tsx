import React, { useEffect, useState } from 'react';
import { readDataPaginated } from '../services/supabaseUtils';
import { stripHTML } from '../lib/htmlUtils';

// Article type (copy from ArticleList)
type Article = {
  id: number;
  title: string;
  content: string;
  created_at?: string;
};

const Beranda: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const { data } = await readDataPaginated('articles', {
          limit: 3,
          offset: 0,
          orderBy: 'created_at',
          orderDir: 'desc',
        });
        setArticles(data || []);
      } catch (error) {
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        backgroundImage: 'url(gedungsate.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#fff',
        padding: '0 1rem'
      }}>
        {/* Overlay hitam transparan */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}></div>

        {/* Teks dan Tombol */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '900px' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            margin: 0,
            lineHeight: 1.3
          }}>
            Data Bidang Kesehatan <br />
            Biro Kesejahteraan Rakyat <br />
            Provinsi Jawa Barat
          </h1>
          <p style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 300 }}>
            Kumpulan data untuk memudahkan pegawai bidang kesehatan dalam mengelola dokumen
          </p>
          <a
            href="/dashboard"
            style={{
              display: 'inline-block',
              marginTop: '2rem',
              backgroundColor: '#2863a7',
              color: '#fff',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: 'bold',
              textDecoration: 'none',
              transition: 'background-color 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#213c88';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#2863a7';
            }}
          >
            Mulai
          </a>
        </div>
      </section>
    {/* Artikel Terbaru */}
    <section style={{
      padding: '4rem 2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <h2 style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        Artikel Terbaru
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem'
      }}>
        {/* Card Artikel */}
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>Memuat artikel...</div>
        ) : articles.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>Belum ada artikel.</div>
        ) : (
          articles.map((article) => (
            <div key={article.id} style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ 
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '0.75rem'
                }}>
                  {article.title}
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: '#666',
                  marginBottom: '1rem',
                  lineHeight: 1.6,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {stripHTML(article.content)}
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: '#888',
                  fontSize: '0.8rem'
                }}>
                  <span>{article.created_at ? new Date(article.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : ''}</span>
                  <a href={`/article/${article.id}`} style={{
                    color: '#2863a7',
                    textDecoration: 'none',
                    fontWeight: 'bold'
                  }}>
                    Baca Selengkapnya
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {articles.length >= 3 && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a href="/articles" style={{ color: '#2863a7', textDecoration: 'none', fontWeight: 'bold' }}>
            Lihat Semua Artikel
          </a>
        </div>
      )}
    </section>
    </main>
  );
};

export default Beranda;
