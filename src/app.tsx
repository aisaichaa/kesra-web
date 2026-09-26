import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './pages/Header';
import DashboardHeader from './pages/DashboardHeader';
import Footer from './pages/Footer';
import Beranda from './pages/Home';
import DocumentArchives from './pages/Document';
import ArticleList from './pages/ArticleList';
import ArticleCreate from './pages/ArticleCreate';
import ArticleEdit from './pages/ArticleEdit';
import ArticleSingle from './pages/ArticleSingle';
import ArticleAll from './pages/ArticleAll';

const LayoutWithHeaderFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Header />
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {children}
    </div>
    <Footer />
  </div>
);

const LayoutDashboard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <DashboardHeader />
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {children}
    </div>
    <Footer />
  </div>
);

const AppContent: React.FC = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route
        path="/dashboard"
        element={<Navigate to="/dashboard/archives" replace />}
      />
      {/* Dashboard: Layout Khusus */}
      <Route
        path="/dashboard/archives"
        element={
          <LayoutDashboard>
            <DocumentArchives />
          </LayoutDashboard>
        }
      />

      {/* Halaman Umum: Header + Footer */}
      <Route
        path="/"
        element={
          <LayoutWithHeaderFooter>
            <Beranda />
          </LayoutWithHeaderFooter>
        }
      />

      {/* Single Article Page */}
      <Route
        path="/article/:id"
        element={
          <LayoutWithHeaderFooter>
            <ArticleSingle />
          </LayoutWithHeaderFooter>
        }
      />

      {/* All Articles Page */}
      <Route
        path="/articles"
        element={
          <LayoutWithHeaderFooter>
            <ArticleAll />
          </LayoutWithHeaderFooter>
        }
      />

      {/* Tambahan: CRUD Article dengan layout dashboard */}
      <Route
        path="/dashboard/articles"
        element={
          <LayoutDashboard>
            <ArticleList />
          </LayoutDashboard>
        }
      />
      <Route
        path="/dashboard/articles/create"
        element={
          <LayoutDashboard>
            <ArticleCreate />
          </LayoutDashboard>
        }
      />
      <Route
        path="/dashboard/articles/edit/:id"
        element={
          <LayoutDashboard>
            <ArticleEdit />
          </LayoutDashboard>
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;