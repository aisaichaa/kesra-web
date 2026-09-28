import React from 'react';
import { createData } from '../services/supabaseUtils';
import { useNavigate } from 'react-router-dom';
import ArticleForm from './ArticleForm';

const ArticleCreate: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: 16, paddingTop: '40px' }}>
      <h2>Buat Artikel</h2>
      <ArticleForm
        submitLabel="Simpan"
        onSubmit={async ({ title, content }) => {
          await createData('articles', { title, content });
          navigate('/dashboard/articles');
        }}
        onCancel={() => navigate('/dashboard/articles')}
      />
    </div>
  );
};

export default ArticleCreate; 