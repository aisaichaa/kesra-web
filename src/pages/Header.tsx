import React from 'react';

const Header: React.FC = () => {
  return (
    <header style={{
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      color: '#fff',
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 10,
      padding: '0.75rem 2rem',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <img src="/logoweb.png" alt="Logo" style={{ height: '40px' }} />
            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#ddd' }}>
              Bidang Kesehatan Kesra
            </span>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
