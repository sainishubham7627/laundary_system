import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import './LoginPage.css';

const LoginPage = () => {
  const { t } = useTranslation();
  const [form, setForm]     = useState({ username: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login }           = useAuth();
  const navigate            = useNavigate();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page page-enter">
      <div className="login-glow" />

      <div className="login-card card">
        <div className="login-header">
          <div className="login-icon">🔐</div>
          <h1 className="login-title">{t('login.title')}</h1>
          <p className="login-sub">{t('login.subtitle')}</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">{t('login.username')}</label>
            <input
              id="username"
              name="username"
              type="text"
              className="form-input"
              placeholder={t('login.username')}
              value={form.username}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">{t('login.password')}</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder={t('login.password')}
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            id="loginBtn"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : t('login.btn')}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an admin account?&nbsp;
            <Link to="/admin/register">Register here</Link>
          </p>
          <p style={{ marginTop: 8 }}>
            <Link to="/">← Back to Student Tracking</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
