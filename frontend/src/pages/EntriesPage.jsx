import { useEffect, useState } from 'react';
import { getAllEntries, updateStatus, deleteEntry } from '../services/api';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './EntriesPage.css';

const STATUSES = ['All', 'Submitted', 'Washing', 'Ready', 'Collected'];
const statusClass = (s) => ({ Submitted: 'badge-submitted', Washing: 'badge-washing', Ready: 'badge-ready', Collected: 'badge-collected' }[s] || '');
const statusIcon  = (s) => ({ Submitted: '📋', Washing: '🫧', Ready: '✅', Collected: '🎒' }[s] || '●');
const formatDate  = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const EntriesPage = () => {
  const { t } = useTranslation();
  const [entries,      setEntries]      = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search,       setSearch]       = useState('');
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [updating,     setUpdating]     = useState(null);
  const [noteModal,    setNoteModal]    = useState(null); // { id, status }

  const fetchEntries = async () => {
    try {
      const data = await getAllEntries();
      setEntries(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  // Client-side filter
  useEffect(() => {
    let result = [...entries];
    if (statusFilter !== 'All') result = result.filter((e) => e.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (e) =>
          e.registrationNumber.toLowerCase().includes(q) ||
          e.customer?.name?.toLowerCase().includes(q) ||
          e.customer?.phone?.includes(q)
      );
    }
    setFiltered(result);
  }, [entries, statusFilter, search]);

  const handleStatusUpdate = async (id, newStatus, notes = '') => {
    setUpdating(id);
    try {
      const { data } = await updateStatus(id, newStatus, 'admin', notes || undefined);
      setEntries((prev) => prev.map((e) => (e._id === id ? data : e)));
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(null);
      setNoteModal(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this laundry order?')) return;
    try {
      await deleteEntry(id);
      setEntries((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="entries-page page-enter">
      <div className="container">
        {/* Header */}
        <div className="entries-header">
          <div>
            <h1 className="entries-title">{t('entries.title')}</h1>
            <p className="entries-sub">{filtered.length} orders shown</p>
          </div>
          <Link to="/admin/create">
            <button className="btn btn-primary" id="addEntryBtn">＋ {t('navbar.new_entry')}</button>
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Filters */}
        <div className="entries-filters">
          <input
            type="text"
            className="form-input search-input"
            placeholder={t('entries.search_reg_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="searchInput"
          />
          <div className="status-filters">
            {STATUSES.map((s) => (
              <button
                key={s}
                className={`filter-btn ${statusFilter === s ? 'active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'All' ? t('entries.all_statuses') : t(`dashboard.${s.toLowerCase()}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Entries */}
        {loading ? (
          <div className="entries-loading">
            <div className="spinner" style={{ width: 36, height: 36 }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card empty-state">
            <p>{t('entries.no_orders')}</p>
            {entries.length === 0 && (
              <Link to="/admin/create">
                <button className="btn btn-primary" style={{ marginTop: 16 }}>{t('navbar.new_entry')}</button>
              </Link>
            )}
          </div>
        ) : (
          <div className="entries-grid">
            {filtered.map((entry) => (
              <div className="card entry-card" key={entry._id}>
                {/* Top */}
                <div className="entry-card-top">
                  <div>
                    <span className="entry-reg">{entry.registrationNumber}</span>
                    <h3 className="entry-name">{entry.customer?.name}</h3>
                    <span className="entry-meta">
                      📞 {entry.customer?.phone}
                    </span>
                    <span className="entry-meta" style={{ display: 'block', marginTop: 2 }}>
                      Submitted {formatDate(entry.createdAt)}
                    </span>
                  </div>
                  <span className={`badge ${statusClass(entry.status)}`}>
                    {statusIcon(entry.status)} {t(`dashboard.${entry.status.toLowerCase()}`)}
                  </span>
                </div>

                {/* Clothes count */}
                <div className="entry-count-chip">
                  🧺 <strong>{entry.clothesCount}</strong> items
                  &nbsp;·&nbsp; {entry.statusHistory?.length || 1} status update{(entry.statusHistory?.length || 1) !== 1 ? 's' : ''}
                </div>

                {/* Status update */}
                <div className="entry-actions">
                  <div className="status-update-row">
                    <label className="form-label" style={{ marginBottom: 0 }}>Update Status:</label>
                    <select
                      className="form-select status-select"
                      value={entry.status}
                      disabled={updating === entry._id}
                      onChange={(e) => handleStatusUpdate(entry._id, e.target.value)}
                    >
                      {['Submitted', 'Washing', 'Ready', 'Collected'].map((s) => (
                        <option 
                          key={s} 
                          value={s}
                          disabled={s === 'Collected' && entry.status !== 'Ready'}
                        >
                          {t(`dashboard.${s.toLowerCase()}`)}
                        </option>
                      ))}
                    </select>
                    {updating === entry._id && <span className="spinner" />}
                  </div>
                  <div className="entry-btns">
                    <Link to={`/admin/entries/${entry._id}`}>
                      <button className="btn btn-secondary btn-sm">{t('entries.view')}</button>
                    </Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(entry._id)}>
                      {t('detail.delete_order')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntriesPage;
