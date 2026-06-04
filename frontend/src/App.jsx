import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import TrackPage       from './pages/TrackPage';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import DashboardPage   from './pages/DashboardPage';
import EntriesPage     from './pages/EntriesPage';
import CreateEntryPage from './pages/CreateEntryPage';
import EntryDetailPage from './pages/EntryDetailPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import ComplaintsAdminPage from './pages/ComplaintsAdminPage';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public – Student */}
        <Route path="/"                  element={<TrackPage />} />

        {/* Public – Admin auth */}
        <Route path="/admin/login"       element={<LoginPage />} />
        <Route path="/admin/register"    element={<RegisterPage />} />

        {/* Protected – Admin */}
        <Route path="/admin/dashboard"   element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/admin/entries"     element={<ProtectedRoute><EntriesPage /></ProtectedRoute>} />
        <Route path="/admin/create"      element={<ProtectedRoute><CreateEntryPage /></ProtectedRoute>} />
        <Route path="/admin/entries/:id" element={<ProtectedRoute><EntryDetailPage /></ProtectedRoute>} />
        <Route path="/admin/settings"    element={<ProtectedRoute><AdminSettingsPage /></ProtectedRoute>} />
        <Route path="/admin/complaints"  element={<ProtectedRoute><ComplaintsAdminPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
