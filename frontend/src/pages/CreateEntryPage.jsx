import { useState } from 'react';
import { createEntry } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './CreateEntryPage.css';

const CreateEntryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    registrationNumber: '',
    clothesCount: 1,
    customer: { name: '', phone: '', email: '' },
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  // Top-level field change
  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Nested customer field change
  const handleCustomerChange = (e) =>
    setForm((p) => ({
      ...p,
      customer: { ...p.customer, [e.target.name]: e.target.value },
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createEntry({
        registrationNumber: form.registrationNumber.toUpperCase(),
        clothesCount: Number(form.clothesCount),
        customer:     form.customer,
        notes:        form.notes || undefined,
        changedBy:    'admin',
      });
      setSuccess('Order created successfully!');
      setTimeout(() => navigate('/admin/entries'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page page-enter">
      <div className="container">
        <div className="create-header">
          <div>
            <h1 className="create-title">{t('create.title')}</h1>
            <p className="create-sub">{t('create.subtitle')}</p>
          </div>
          <Link to="/admin/entries">
            <button className="btn btn-secondary">{t('create.back')}</button>
          </Link>
        </div>

        <div className="create-grid">
          {/* ── Form ── */}
          <div className="card create-form-card">
            {error   && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit}>
              {/* Customer section */}
              <p className="section-label">{t('create.customer_info')}</p>

              <div className="form-group">
                <label className="form-label" htmlFor="registrationNumber">{t('create.reg_no')}</label>
                <input
                  id="registrationNumber"
                  name="registrationNumber"
                  type="text"
                  className="form-input"
                  placeholder={t('create.reg_no_placeholder')}
                  value={form.registrationNumber}
                  onChange={handleChange}
                  style={{ textTransform: 'uppercase' }}
                  minLength={5}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="cust-name">{t('create.full_name')}</label>
                  <input
                    id="cust-name"
                    name="name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Priya Sharma"
                    value={form.customer.name}
                    onChange={handleCustomerChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cust-email">Email (optional)</label>
                  <input
                    id="cust-email"
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="e.g. user@example.com"
                    value={form.customer.email}
                    onChange={handleCustomerChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-group">
                  <label className="form-label" htmlFor="cust-phone">{t('create.phone')}</label>
                  <input
                    id="cust-phone"
                    name="phone"
                    type="tel"
                    className="form-input"
                    placeholder="e.g. 9800123456"
                    value={form.customer.phone}
                    onChange={handleCustomerChange}
                    pattern="\d{10}"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {/* Order section */}
              <p className="section-label" style={{ marginTop: 8 }}>{t('create.order_details')}</p>

              <div className="form-group">
                <label className="form-label" htmlFor="clothesCount">{t('create.clothes_count')}</label>
                <input
                  id="clothesCount"
                  name="clothesCount"
                  type="number"
                  className="form-input"
                  min={1}
                  value={form.clothesCount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="notes">{t('create.notes')}</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-textarea"
                  placeholder="e.g. 3 shirts, 2 kurtas — stain on collar"
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                id="submitEntryBtn"
                className="btn btn-primary btn-lg w-full"
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : t('create.btn_submit')}
              </button>
            </form>
          </div>

          {/* ── Preview panel ── */}
          <div className="create-preview card">
            <h3 className="preview-title">{t('create.preview_title')}</h3>

            <div className="preview-field">
              <span className="preview-key">{t('create.preview_reg')}</span>
              <span className="preview-val" style={{ color: form.registrationNumber ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                {form.registrationNumber ? form.registrationNumber.toUpperCase() : t('create.waiting_input')}
              </span>
            </div>

            <div className="preview-field">
              <span className="preview-key">{t('create.preview_customer')}</span>
              <span className="preview-val">{form.customer.name || '—'}</span>
            </div>

            <div className="preview-field">
              <span className="preview-key">{t('create.preview_phone')}</span>
              <span className="preview-val">{form.customer.phone || '—'}</span>
            </div>

            {form.customer.email && (
              <div className="preview-field">
                <span className="preview-key">Email</span>
                <span className="preview-val">{form.customer.email}</span>
              </div>
            )}

            <div className="preview-field">
              <span className="preview-key">{t('create.preview_clothes')}</span>
              <span className="preview-val" style={{ color: 'var(--color-primary)', fontSize: '1.5rem', fontWeight: 800 }}>
                {form.clothesCount}
              </span>
            </div>

            <div className="preview-field">
              <span className="preview-key">{t('create.preview_status')}</span>
              <span className="badge badge-submitted">📋 {t('dashboard.submitted')}</span>
            </div>

            {form.notes && (
              <div className="preview-field">
                <span className="preview-key">{t('create.preview_notes')}</span>
                <span className="preview-val" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {form.notes}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEntryPage;
