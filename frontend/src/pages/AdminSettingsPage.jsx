import { useState } from 'react';
import { updateAdminSettings, deleteAdminAccount } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './AdminSettingsPage.css';

const AdminSettingsPage = () => {
  const { t } = useTranslation();
  const { admin, login, logout } = useAuth();
  const navigate = useNavigate();

  // Update State
  const [updateForm, setUpdateForm] = useState({
    currentPassword: '',
    newUsername: '',
    newPassword: '',
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');

  // Delete State
  const [deleteForm, setDeleteForm] = useState({
    currentPassword: '',
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleUpdateChange = (e) => setUpdateForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleDeleteChange = (e) => setDeleteForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateSuccess('');
    setUpdateLoading(true);
    
    try {
      const payload = {
        currentPassword: updateForm.currentPassword,
      };
      if (updateForm.newUsername) payload.newUsername = updateForm.newUsername;
      if (updateForm.newPassword) payload.newPassword = updateForm.newPassword;

      const res = await updateAdminSettings(payload);
      
      // Update local storage token and context
      localStorage.setItem('laundry_token', res.token);
      localStorage.setItem('laundry_admin', JSON.stringify(res.admin));
      login(res.admin);

      setUpdateSuccess('Settings updated successfully!');
      setUpdateForm({ currentPassword: '', newUsername: '', newPassword: '' });
    } catch (err) {
      setUpdateError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    
    const confirmMsg = "Are you absolutely sure you want to delete your admin account? THIS WILL PERMANENTLY DELETE ALL YOUR LAUNDRY ORDERS. This action cannot be undone.";
    if (!window.confirm(confirmMsg)) return;

    setDeleteError('');
    setDeleteLoading(true);

    try {
      await deleteAdminAccount({ currentPassword: deleteForm.currentPassword });
      alert("Account and all associated data deleted successfully.");
      logout();
      navigate('/admin/login');
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="settings-page page-enter">
      <div className="container">
        <div className="settings-header" style={{ textAlign: 'center' }}>
          <h1 className="settings-title">{t('settings.title')}</h1>
          <p className="settings-sub">{t('settings.subtitle')}</p>
        </div>

        <div className="settings-grid">
          
          {/* Update Account Card */}
          <div className="card settings-card">
            <h3 className="settings-section-title">{t('settings.update_profile')}</h3>
            
            {updateSuccess && <div className="alert alert-success">{updateSuccess}</div>}
            {updateError && <div className="alert alert-error">{updateError}</div>}
            
            <form onSubmit={handleUpdateSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="currentPassword">{t('settings.current_password')}</label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  className="form-input"
                  placeholder="Enter current password to authorize changes"
                  value={updateForm.currentPassword}
                  onChange={handleUpdateChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="newUsername">{t('settings.new_username')}</label>
                <input
                  id="newUsername"
                  name="newUsername"
                  type="text"
                  className="form-input"
                  placeholder={`Current: ${admin?.username}`}
                  value={updateForm.newUsername}
                  onChange={handleUpdateChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="newPassword">{t('settings.new_password')}</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  className="form-input"
                  placeholder="Leave blank to keep current password"
                  value={updateForm.newPassword}
                  onChange={handleUpdateChange}
                />
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={updateLoading}>
                {updateLoading ? <span className="spinner" /> : t('settings.btn_save')}
              </button>
            </form>
          </div>

          {/* Delete Account Card */}
          <div className="card settings-card danger-zone">
            <h3 className="settings-section-title">{t('settings.danger_zone')}</h3>
            <p className="settings-info">
              {t('settings.danger_info')}
            </p>
            
            {deleteError && <div className="alert alert-error">{deleteError}</div>}
            
            <form onSubmit={handleDeleteSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="delCurrentPassword">{t('settings.current_password')}</label>
                <input
                  id="delCurrentPassword"
                  name="currentPassword"
                  type="password"
                  className="form-input"
                  placeholder="Enter current password to confirm deletion"
                  value={deleteForm.currentPassword}
                  onChange={handleDeleteChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-danger w-full" disabled={deleteLoading}>
                {deleteLoading ? <span className="spinner" /> : t('settings.btn_delete')}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
