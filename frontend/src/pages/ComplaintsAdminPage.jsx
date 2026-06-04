import { useEffect, useState } from 'react';
import { getComplaints, createComplaint, resolveComplaint, deleteComplaint } from '../services/api';
import './ComplaintsAdminPage.css';

const ComplaintsAdminPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [postText, setPostText] = useState('');
  const [postLoading, setPostLoading] = useState(false);

  const fetchComplaints = async () => {
    try {
      const { data } = await getComplaints();
      setComplaints(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!postText.trim()) return;
    setPostLoading(true);
    try {
      await createComplaint({
        senderType: 'Admin',
        message: postText,
      });
      setPostText('');
      fetchComplaints();
    } catch (err) {
      alert(err.message);
    } finally {
      setPostLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await resolveComplaint(id);
      setComplaints((prev) => prev.map(c => c._id === id ? { ...c, status: 'Resolved' } : c));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await deleteComplaint(id);
      setComplaints((prev) => prev.filter(c => c._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="complaints-admin-page page-enter">
      <div className="container">
        <div className="complaints-header">
          <div>
            <h1 className="complaints-title">Notice Board & Complaints</h1>
            <p className="complaints-sub">Manage student complaints and post announcements</p>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="complaints-grid">
          {/* Main Feed */}
          <div className="complaint-list">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}><span className="spinner"></span></div>
            ) : complaints.length === 0 ? (
              <div className="card empty-state">No messages or complaints yet.</div>
            ) : (
              complaints.map((comp) => (
                <div key={comp._id} className={`card complaint-card ${comp.senderType === 'Admin' ? 'announcement' : 'student'} ${comp.status === 'Resolved' ? 'resolved' : ''}`}>
                  <div className="comp-header">
                    <div className="comp-sender">
                      {comp.senderType === 'Admin' ? '📢 Admin Announcement' : '👤 Student Complaint'}
                      {comp.senderType === 'Student' && (
                        <span className={`badge ${comp.status === 'Resolved' ? 'badge-collected' : 'badge-submitted'}`}>
                          {comp.status}
                        </span>
                      )}
                    </div>
                    <span className="comp-meta">{formatDate(comp.createdAt)}</span>
                  </div>
                  
                  {comp.senderType === 'Student' && comp.registrationNumber && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                      Ref Reg No: {comp.registrationNumber}
                    </div>
                  )}

                  <div className="comp-message">{comp.message}</div>

                  <div className="comp-actions">
                    {comp.senderType === 'Student' && comp.status === 'Open' && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleResolve(comp._id)}>
                        ✅ Mark Resolved
                      </button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(comp._id)}>
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Post Form */}
          <div>
            <div className="card post-form-card">
              <h3 className="post-title">📢 Post Announcement</h3>
              <form onSubmit={handlePost}>
                <textarea
                  className="form-textarea"
                  placeholder="E.g., We found a blue hoodie in the laundry room..."
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  required
                  rows={4}
                />
                <button type="submit" className="btn btn-primary w-full" disabled={postLoading}>
                  {postLoading ? <span className="spinner"/> : 'Post to Notice Board'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintsAdminPage;
