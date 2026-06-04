import { useState, useEffect } from 'react';
import { trackByRegNo, getComplaints, createComplaint } from '../services/api';
import { useTranslation } from 'react-i18next';
import './TrackPage.css';

const STATUS_ORDER = ['Submitted', 'Washing', 'Ready', 'Collected'];

const statusIcon  = (s) => ({ Submitted: '📋', Washing: '🫧', Ready: '✅', Collected: '🎒' }[s] || '●');
const statusClass = (s) => ({ Submitted: 'badge-submitted', Washing: 'badge-washing', Ready: 'badge-ready', Collected: 'badge-collected' }[s] || '');

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

// ── Animated progress bar (styled for light theme) ───────────────────────────
const ProgressBar = ({ status }) => {
  const { t } = useTranslation();
  const step = STATUS_ORDER.indexOf(status);
  return (
    <div className="progress-track">
      {STATUS_ORDER.map((s, i) => (
        <div key={s} className={`progress-step ${i <= step ? 'done' : ''} ${i === step ? 'active' : ''}`}>
          <div className="progress-dot">{statusIcon(s)}</div>
          <span className="progress-label">{t(`dashboard.${s.toLowerCase()}`)}</span>
          {i < STATUS_ORDER.length - 1 && (
            <div className={`progress-line ${i < step ? 'done' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
};

// ── Status history timeline (Poornima Menu Card Style) ───────────────────────
const StatusHistory = ({ history }) => {
  const { t } = useTranslation();
  if (!history || history.length === 0) return null;
  return (
    <div className="history-section">
      <h4 className="section-title">{t('track.timeline')}</h4>
      <div className="history-grid">
        {[...history].reverse().map((h, i) => (
          <div key={i} className="menu-card">
            <h5 className="menu-card-title">{statusIcon(h.status)} {t(`dashboard.${h.status.toLowerCase()}`)}</h5>
            <div className="menu-card-body">
              <span className="menu-card-text">{formatDate(h.changedAt)}</span>
              <span className="menu-card-text">Updated by: {h.changedBy}</span>
              {h.notes && <span className="menu-card-note">Note: {h.notes}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────
const TrackPage = () => {
  const { t } = useTranslation();
  const [regNo,   setRegNo]   = useState('');
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Complaints & Notices state
  const [notices, setNotices] = useState([]);
  const [compForm, setCompForm] = useState({ registrationNumber: '', message: '' });
  const [compLoading, setCompLoading] = useState(false);
  const [compError, setCompError] = useState('');
  const [compSuccess, setCompSuccess] = useState('');

  const fetchNotices = async () => {
    try {
      const { data } = await getComplaints();
      setNotices(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handlePostComplaint = async (e) => {
    e.preventDefault();
    setCompError('');
    setCompSuccess('');
    if (!compForm.message.trim() || !compForm.registrationNumber.trim()) return;
    setCompLoading(true);
    try {
      await createComplaint({
        senderType: 'Student',
        registrationNumber: compForm.registrationNumber,
        message: compForm.message,
      });
      setCompSuccess('Complaint submitted successfully!');
      setCompForm({ registrationNumber: '', message: '' });
      fetchNotices(); // Refresh
    } catch (err) {
      setCompError(err.message);
    } finally {
      setCompLoading(false);
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!regNo.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const data = await trackByRegNo(regNo.trim());
      setOrder(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="track-page page-enter">
      {/* Hero */}
      <div className="track-hero">
        <h1 className="track-hero-title">
          {t('track.hero_title')}
        </h1>
        <p className="track-hero-sub">
          {t('track.hero_subtitle')}
        </p>

        <form className="track-form" onSubmit={handleTrack}>
          <input
            id="regNoInput"
            type="text"
            className="form-input track-input"
            placeholder={t('track.search_placeholder')}
            value={regNo}
            onChange={(e) => setRegNo(e.target.value.toUpperCase())}
            autoFocus
          />
          <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : t('track.btn_track')}
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="container">
        {error && <div className="alert alert-error">{error}</div>}

        {order && (
          <div className="track-results">
            <div className="card track-card">
              {/* Header */}
              <div className="track-card-header">
                <div>
                  <span className="entry-reg">
                    {order.registrationNumber}
                  </span>
                  <h3 className="track-card-name">{order.customer?.name}</h3>
                  <span className="track-card-meta">
                    {order.customer?.phone} {order.customer?.email && `| ${order.customer.email}`}
                  </span>
                </div>
                <span className={`badge ${statusClass(order.status)}`}>
                  {statusIcon(order.status)} {t(`dashboard.${order.status.toLowerCase()}`)}
                </span>
              </div>

              {/* Progress bar */}
              <ProgressBar status={order.status} />

              {/* Order Summary styled as a menu card */}
              <div className="menu-card summary-card">
                <h5 className="menu-card-title">Order Summary</h5>
                <div className="menu-card-body">
                  <span className="menu-card-text">{t('track.clothes_count')}: {order.clothesCount}</span>
                  <span className="menu-card-text">Submitted: {formatDate(order.createdAt)}</span>
                </div>
              </div>

              {/* Status history */}
              <StatusHistory history={order.statusHistory} />
            </div>
          </div>
        )}

        {/* ── Notice Board & Complain Box ── */}
        <div className="notice-board-section" style={{ marginTop: '60px' }}>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '30px' }}>Notice Board & Complaints</h2>
          
          <div className="complaints-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
            {/* Feed */}
            <div className="complaint-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {notices.length === 0 ? (
                <div className="card empty-state">No announcements or complaints yet.</div>
              ) : (
                notices.map((comp) => (
                  <div key={comp._id} className="card" style={{ 
                    padding: '16px', 
                    borderLeft: `5px solid ${comp.senderType === 'Admin' ? 'var(--color-primary)' : '#dc3545'}`,
                    opacity: comp.status === 'Resolved' ? 0.7 : 1
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ color: comp.senderType === 'Admin' ? 'var(--color-primary)' : '#333' }}>
                        {comp.senderType === 'Admin' ? '📢 Admin Announcement' : '👤 Anonymous Student'}
                      </strong>
                      <span style={{ fontSize: '0.85rem', color: '#888' }}>{formatDate(comp.createdAt)}</span>
                    </div>
                    {comp.senderType === 'Student' && (
                      <div style={{ marginBottom: '8px' }}>
                        <span className={`badge ${comp.status === 'Resolved' ? 'badge-collected' : 'badge-submitted'}`}>
                          {comp.status}
                        </span>
                      </div>
                    )}
                    <p style={{ margin: 0, color: '#444', lineHeight: 1.5 }}>{comp.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Complain Form */}
            <div>
              <div className="card" style={{ position: 'sticky', top: '24px', padding: '20px' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', color: '#dc3545' }}>📝 File a Complaint</h3>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '16px' }}>
                  Missing clothes? Found someone else's item? Let the admin know here.
                </p>
                
                {compSuccess && <div className="alert alert-success">{compSuccess}</div>}
                {compError && <div className="alert alert-error">{compError}</div>}
                
                <form onSubmit={handlePostComplaint}>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label">Registration No.</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. PU12345" 
                      value={compForm.registrationNumber}
                      onChange={(e) => setCompForm({...compForm, registrationNumber: e.target.value.toUpperCase()})}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Message</label>
                    <textarea 
                      className="form-textarea" 
                      placeholder="e.g. I am missing 1 pair of black socks..." 
                      rows="4"
                      value={compForm.message}
                      onChange={(e) => setCompForm({...compForm, message: e.target.value})}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-full" disabled={compLoading} style={{ background: '#dc3545', borderColor: '#dc3545' }}>
                    {compLoading ? <span className="spinner"/> : 'Submit Complaint'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrackPage;
