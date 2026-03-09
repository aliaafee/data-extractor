import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Users from './pages/Users';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading, setupRequired } = useAuth();

  if (loading) return <div className="center">Loading…</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/projects" replace /> : <Login />} />
      <Route path="/register" element={
        // Allow: admin user OR guest during first-run setup
        user?.role === 'admin' || setupRequired
          ? <Register />
          : <Navigate to={user ? '/projects' : '/login'} replace />
      } />
      <Route path="/" element={<Navigate to="/projects" replace />} />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <AdminRoute>
            <Users />
          </AdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}

export default App;
