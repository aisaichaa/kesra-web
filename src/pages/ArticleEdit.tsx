import React, { useEffect, useState } from 'react';
import { readData, updateData } from '../services/supabaseUtils';
import { useNavigate, useParams } from 'react-router-dom';
import ArticleForm from './ArticleForm';

type Article = {
  id: number;
  title: string;
  content: string;
  created_at?: string;
};

const ArticleEdit: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const data = await readData('articles', { id: Number(id) });
        const article = data[0];
        setTitle(article.title);
        setContent(article.content);
      } catch (error) {
        alert('Failed to fetch article');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchArticle();
  }, [id]);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: 16, paddingTop: '40px' }}>
      <h2>Edit Artikel</h2>
      <ArticleForm
        initialTitle={title}
        initialContent={content}
        submitLabel="Simpan"
        onSubmit={async ({ title, content }) => {
          await updateData('articles', Number(id), { title, content });
          navigate('/dashboard/articles');
        }}
        onCancel={() => navigate('/dashboard/articles')}
      />
    </div>
  );
};

export default ArticleEdit; 