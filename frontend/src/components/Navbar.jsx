import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Navbar.css';

const Navbar = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  const isAdminArea = location.pathname.startsWith('/admin');

  return (
    <header className="site-header">
      {/* Top Bar: White Background with Logos & Actions */}
      <div className="header-top">
        <div className="container header-top-inner">
          <div className="header-logos">
            {/* Poornima University Logo */}
            <div className="pu-logo">
              <img 
                src="/logo.png" 
                alt="Poornima University Logo" 
                className="pu-logo-img"
              />
              <div className="pu-text">
                <span className="pu-subtitle">{t('navbar.laundry_system')}</span>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <div className="contact-info">
              <span>📞 +91-8875666618</span>
            </div>
            
            <button className="btn btn-outline btn-sm lang-btn" onClick={toggleLanguage} style={{ marginRight: '10px' }}>
              {i18n.language === 'en' ? 'हिंदी' : 'English'}
            </button>

            {admin ? (
              <div className="admin-actions">
                <span className="user-greeting">Welcome, {admin.username}</span>
                <button className="btn btn-accent btn-sm" onClick={handleLogout}>
                  {t('navbar.logout')}
                </button>
              </div>
            ) : (
              <Link to="/admin/login">
                <button className="btn btn-accent btn-sm">{t('navbar.admin_login')}</button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar: Deep Blue Navigation */}
      <nav className="navbar-bottom">
        <div className="container navbar-inner">
          <div className="navbar-links">
            <Link to="/" className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}>
              Home (Track)
            </Link>
            {admin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`navbar-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
                >
                  {t('navbar.dashboard')}
                </Link>
                <Link
                  to="/admin/entries"
                  className={`navbar-link ${location.pathname === '/admin/entries' ? 'active' : ''}`}
                >
                  {t('navbar.entries')}
                </Link>
                <Link
                  to="/admin/create"
                  className={`navbar-link ${location.pathname === '/admin/create' ? 'active' : ''}`}
                >
                  {t('navbar.new_entry')}
                </Link>
                <Link
                  to="/admin/complaints"
                  className={`navbar-link ${location.pathname === '/admin/complaints' ? 'active' : ''}`}
                >
                  Complaints
                </Link>
                <Link
                  to="/admin/settings"
                  className={`navbar-link ${location.pathname === '/admin/settings' ? 'active' : ''}`}
                >
                  {t('navbar.settings')}
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
