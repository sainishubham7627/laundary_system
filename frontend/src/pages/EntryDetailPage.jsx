import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEntryById, updateStatus, deleteEntry, notifyStudent } from '../services/api';
import { useTranslation } from 'react-i18next';
import './EntryDetailPage.css';

const STATUS_ORDER = ['Submitted', 'Washing', 'Ready', 'Collected'];
const statusClass  = (s) => ({ Submitted: 'badge-submitted', Washing: 'badge-washing', Ready: 'badge-ready', Collected: 'badge-collected' }[s] || '');
const statusIcon   = (s) => ({ Submitted: '📋', Washing: '🫧', Ready: '✅', Collected: '🎒' }[s] || '●');
const formatDate   = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const EntryDetailPage = () => {
  const { t } = useTranslation();
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [order,    setOrder]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [updating, setUpdating] = useState(false);
  const [noteVal,  setNoteVal]  = useState('');
  const [notifyLoading, setNotifyLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await getEntryById(id);
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      const { data } = await updateStatus(id, newStatus, 'admin', noteVal || undefined);
      setOrder(data);
      setNoteVal('');
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this order?')) return;
    await deleteEntry(id);
    navigate('/admin/entries');
  };

  const handleWhatsApp = () => {
    if (!order?.customer?.phone) return;
    const msg = `Hello ${order.customer.name || 'Student'},\n\nYour laundry bag (Reg: ${order.registrationNumber}) with ${order.clothesCount} clothes is now ${order.status}!\n\nThank you.`;
    const url = `https://wa.me/91${order.customer.phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleEmailNotify = async () => {
    setNotifyLoading(true);
    try {
      const { previewUrl } = await notifyStudent(id);
      alert(`Email sent successfully! Preview URL: ${previewUrl}`);
      console.log('Ethereal Email Preview:', previewUrl);
      window.open(previewUrl, '_blank');
    } catch (err) {
      alert(err.message);
    } finally {
      setNotifyLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  if (error || !order) return (
    <div className="container" style={{ padding: '60px 0' }}>
      <div className="alert alert-error">{error || 'Order not found'}</div>
      <Link to="/admin/entries"><button className="btn btn-secondary">← Back to Orders</button></Link>
    </div>
  );

  const currentStep = STATUS_ORDER.indexOf(order.status);

  return (
    <div className="detail-page page-enter">
      <div className="container">
        {/* Header */}
        <div className="detail-header">
          <Link to="/admin/entries">
            <button className="btn btn-secondary btn-sm">{t('detail.back')}</button>
          </Link>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑 {t('detail.btn_delete')}</button>
        </div>

        <div className="detail-grid">
          {/* ── Main info ── */}
          <div>
            <div className="card detail-info-card">
              {/* Customer */}
              <div className="detail-info-header">
                <div>
                  <span className="detail-reg">{order.registrationNumber}</span>
                  <h1 className="detail-name">{order.customer?.name}</h1>
                </div>
                <span className={`badge ${statusClass(order.status)}`} style={{ fontSize: '0.9rem', padding: '6px 16px' }}>
                  {statusIcon(order.status)} {t(`dashboard.${order.status.toLowerCase()}`)}
                </span>
              </div>

              {/* Meta grid */}
              <div className="detail-meta-grid">
                <div className="detail-meta-item">
                  <span className="detail-meta-key">{t('detail.info_phone')}</span>
                  <span className="detail-meta-val">{order.customer?.phone}</span>
                </div>
                <div className="detail-meta-item">
                  <span className="detail-meta-key">{t('detail.info_clothes')}</span>
                  <span className="detail-meta-val" style={{ color: 'var(--color-primary)', fontSize: '1.4rem', fontWeight: 800 }}>
                    {order.clothesCount} pcs
                  </span>
                </div>
                <div className="detail-meta-item">
                  <span className="detail-meta-key">{t('detail.info_date')}</span>
                  <span className="detail-meta-val">{formatDate(order.createdAt)}</span>
                </div>
                <div className="detail-meta-item">
                  <span className="detail-meta-key">Last Updated</span>
                  <span className="detail-meta-val">{formatDate(order.updatedAt)}</span>
                </div>
                <div className="detail-meta-item">
                  <span className="detail-meta-key">Status Updates</span>
                  <span className="detail-meta-val">{order.statusHistory?.length || 0}</span>
                </div>
                {order.customer?.email && (
                  <div className="detail-meta-item">
                    <span className="detail-meta-key">Email</span>
                    <span className="detail-meta-val">{order.customer.email}</span>
                  </div>
                )}
              </div>

              {/* Status History Timeline */}
              <div className="detail-items-section">
                <h3 className="detail-section-title">{t('detail.timeline')}</h3>
                {order.statusHistory && order.statusHistory.length > 0 ? (
                  <div className="history-timeline">
                    {[...order.statusHistory].reverse().map((h, i) => (
                      <div className="ht-entry" key={i}>
                        <div className={`ht-dot badge ${statusClass(h.status)}`}>
                          {statusIcon(h.status)}
                        </div>
                        <div className="ht-body">
                          <div className="ht-header">
                            <strong>{t(`dashboard.${h.status.toLowerCase()}`)}</strong>
                            <span className="ht-time">{formatDate(h.changedAt)}</span>
                          </div>
                          <span className="ht-by">by {h.changedBy}</span>
                          {h.notes && <p className="ht-notes">{h.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No history yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Status panel ── */}
          <div>
            <div className="card status-panel">
              <h3 className="detail-section-title" style={{ marginBottom: 20 }}>{t('detail.update_status')}</h3>

              {/* Optional note for this transition */}
              <div className="form-group">
                <label className="form-label" htmlFor="transitionNote">Remarks (optional)</label>
                <input
                  id="transitionNote"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Stain removed"
                  value={noteVal}
                  onChange={(e) => setNoteVal(e.target.value)}
                  disabled={updating}
                />
              </div>

              <div className="status-timeline">
                {STATUS_ORDER.map((s, i) => (
                  <button
                    key={s}
                    className={`status-timeline-btn ${i <= currentStep ? 'done' : ''} ${s === order.status ? 'current' : ''}`}
                    onClick={() => handleStatusChange(s)}
                    disabled={updating || s === order.status || (s === 'Collected' && order.status !== 'Ready')}
                  >
                    <span className="stl-icon">{statusIcon(s)}</span>
                    <div className="stl-info">
                      <span className="stl-label">{t(`dashboard.${s.toLowerCase()}`)}</span>
                      {s === order.status && <span className="stl-current-tag">Current</span>}
                    </div>
                  </button>
                ))}
              </div>

              {updating && (
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <span className="spinner" />
                </div>
              )}

              {/* Notification Actions */}
              {(order.status === 'Ready' || order.status === 'Collected') && (
                <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #eee' }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 12 }}>Notify Student</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                      className="btn btn-secondary w-full" 
                      onClick={handleWhatsApp}
                      style={{ background: '#25D366', color: 'white', borderColor: '#25D366', flex: 1 }}
                    >
                      💬 WhatsApp
                    </button>
                    {order.customer?.email && (
                      <button 
                        className="btn btn-secondary w-full" 
                        onClick={handleEmailNotify}
                        disabled={notifyLoading}
                        style={{ flex: 1 }}
                      >
                        {notifyLoading ? <span className="spinner" style={{width: 16, height: 16}} /> : '✉️ Email'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryDetailPage;
