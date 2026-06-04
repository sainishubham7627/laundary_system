import { useEffect, useState } from 'react';
import { getStats, getAllEntries } from '../services/api';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './DashboardPage.css';

const statusClass = (s) => ({ Submitted: 'badge-submitted', Washing: 'badge-washing', Ready: 'badge-ready', Collected: 'badge-collected' }[s] || '');

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const DashboardPage = () => {
  const { t } = useTranslation();
  const [stats,   setStats]   = useState(null);
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const STATUSES = [
    { key: 'total',        label: t('dashboard.total_orders'),  icon: '📦', color: 'var(--color-primary)' },
    { key: 'totalClothes', label: t('dashboard.total_clothes'), icon: '👕', color: 'var(--color-accent)' },
    { key: 'Submitted',    label: t('dashboard.submitted'),     icon: '📋', color: 'var(--status-submitted)' },
    { key: 'Washing',      label: t('dashboard.washing'),       icon: '🫧', color: 'var(--status-washing)' },
    { key: 'Ready',        label: t('dashboard.ready'),         icon: '✅', color: 'var(--status-ready)' },
    { key: 'Collected',    label: t('dashboard.collected'),     icon: '🎒', color: 'var(--status-collected)' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, entriesData] = await Promise.all([
          getStats(),
          getAllEntries(),
        ]);
        setStats(statsData.data);
        setRecent(entriesData.data.slice(0, 5));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="dashboard-loading">
      <div className="spinner" style={{ width: 40, height: 40 }} />
      <p>Loading dashboard…</p>
    </div>
  );

  return (
    <div className="dashboard page-enter">
      <div className="container">
        {/* Page header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">{t('dashboard.title')}</h1>
            <p className="dashboard-sub">{t('dashboard.subtitle')}</p>
          </div>
          <Link to="/admin/create">
            <button className="btn btn-primary" id="newEntryBtn">＋ {t('navbar.new_entry')}</button>
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Stats grid */}
        {stats && (
          <div className="stats-grid">
            {STATUSES.map(({ key, label, icon, color }) => (
              <div className="stat-card card" key={key}>
                <div className="stat-icon" style={{ color }}>{icon}</div>
                <div className="stat-value" style={{ color }}>{stats[key] ?? 0}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Recent entries table */}
        <div className="card recent-section">
          <div className="recent-header">
            <h2 className="recent-title">{t('navbar.entries')}</h2>
            <Link to="/admin/entries" className="recent-view-all">{t('entries.view')} →</Link>
          </div>

          {recent.length === 0 ? (
            <div className="empty-state">
              <p>{t('entries.no_orders')} <Link to="/admin/create">{t('navbar.new_entry')}</Link></p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('entries.tbl_reg_no')}</th>
                    <th>{t('entries.tbl_customer')}</th>
                    <th>{t('create.preview_phone')}</th>
                    <th>{t('entries.tbl_clothes')}</th>
                    <th>{t('entries.tbl_status')}</th>
                    <th>{t('entries.tbl_date')}</th>
                    <th>{t('entries.tbl_actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((e) => (
                    <tr key={e._id}>
                      <td className="td-mono">{e.registrationNumber}</td>
                      <td>{e.customer?.name}</td>
                      <td className="td-muted">{e.customer?.phone}</td>
                      <td style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{e.clothesCount} pcs</td>
                      <td><span className={`badge ${statusClass(e.status)}`}>{t(`dashboard.${e.status.toLowerCase()}`)}</span></td>
                      <td className="td-muted">{formatDate(e.createdAt)}</td>
                      <td>
                        <Link to={`/admin/entries/${e._id}`}>
                          <button className="btn btn-secondary btn-sm">{t('entries.view')}</button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
