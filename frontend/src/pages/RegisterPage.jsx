import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerAdmin } from '../services/api';
import './LoginPage.css'; // reuse same layout styles

const RegisterPage = () => {
  const [form, setForm]       = useState({ username: '', password: '', adminSecret: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await registerAdmin(form);
      setSuccess('Admin registered successfully! Redirecting to login…');
      setTimeout(() => navigate('/admin/login'), 1800);
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
          <div className="login-icon">🛡️</div>
          <h1 className="login-title">Register Admin</h1>
          <p className="login-sub">Create a new admin account</p>
        </div>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">Username</label>
            <input id="reg-username" name="username" type="text" className="form-input"
              placeholder="Choose a username" value={form.username} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input id="reg-password" name="password" type="password" className="form-input"
              placeholder="Min 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="adminSecret">Admin Secret Key</label>
            <input id="adminSecret" name="adminSecret" type="password" className="form-input"
              placeholder="Enter admin secret from .env" value={form.adminSecret} onChange={handleChange} required />
          </div>
          <button type="submit" id="registerBtn" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <div className="login-footer">
          <p>Already have an account? <Link to="/admin/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
