import React from 'react';
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';

const Footer: React.FC = () => {
  const iconStyle = { color: 'white', marginRight: '0.5rem' };
  const socialIconStyle = { color: 'white', marginRight: '1rem', fontSize: '1.2rem' };

  return (
    <footer style={{
      padding: '2rem',
      backgroundColor: '#004d99',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      {/* Baris atas: Logo+Kontak di kiri, Sosial Media di kanan */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap'
      }}>
        {/* Logo + Kontak */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          {/* Logo */}
          <div>
            <img src="/logoweb.png" alt="Logo" style={{ height: '50px' }} />
          </div>

          {/* Kontak vertikal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            <p style={{ margin: 0 }}>
              <FaMapMarkerAlt style={iconStyle} />
              Jl. Diponegoro No.22, Citarum, Kec. Bandung Wetan, Kota Bandung, Jawa Barat 40115
            </p>
            <p style={{ margin: 0 }}>
              <FaEnvelope style={iconStyle} />
              birokesra@jabarprov.go.id
            </p>
            <p style={{ margin: 0 }}>
              <FaPhoneAlt style={iconStyle} />
              0224232448
            </p>
          </div>
        </div>

        {/* Sosial Media */}
        <div>
          <p style={{ margin: 7 }}><strong>Sosial Media</strong></p>
          <div>
            <a href="https://www.facebook.com/birokesrajabar" aria-label="Facebook" style={socialIconStyle}><FaFacebookF /></a>
            <a href="https://x.com/birokesrajabar?s=21" aria-label="Twitter" style={socialIconStyle}><FaTwitter /></a>
            <a href="https://www.instagram.com/birokesrajabar?igsh=b2V4cjQzNjgwOXpy" aria-label="Instagram" style={socialIconStyle}><FaInstagram /></a>
            <a href="https://youtube.com/@birokesrajabar500?si=PC6Pfmp3ph__tu6b" aria-label="Youtube" style={socialIconStyle}><FaYoutube /></a>
            <a href="https://www.tiktok.com/@birokesrajabar?_t=ZS-8wtTp3vcdsO&_r=1" aria-label="Tiktok" style={socialIconStyle}><SiTiktok /></a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div style={{ textAlign: 'center', width: '100%', marginTop: '1rem' }}>
        <p style={{ margin: 0 }}>
          &copy; 2025 Biro Kesejahteraan Sekretariat Daerah Provinsi Jawa Barat
        </p>
      </div>
    </footer>
  );
}

export default Footer;
