import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { user, setupRequired, saveAuth } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdminCreating = user?.role === 'admin';
  const isFirstRun = setupRequired && !user;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await register(email, password, isAdminCreating ? role : undefined);
      if (isFirstRun) {
        // Bootstrap: automatically sign in as the new admin
        saveAuth(result.token, result.user);
        navigate('/projects');
      } else {
        navigate('/projects');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const title = isFirstRun ? 'Welcome — Create Admin Account' : isAdminCreating ? 'Create User' : 'Create Account';

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>{title}</h1>
        {isFirstRun && (
          <p className="setup-hint">No users exist yet. This account will be the administrator.</p>
        )}
        {error && <p className="error">{error}</p>}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>
        {isAdminCreating && (
          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        )}
        <button type="submit" disabled={loading}>
          {loading ? 'Saving…' : isFirstRun ? 'Create Admin Account' : isAdminCreating ? 'Create User' : 'Register'}
        </button>
        {!isFirstRun && isAdminCreating && (
          <p className="switch-link">
            <Link to="/projects">← Back to dashboard</Link>
          </p>
        )}
        {!isFirstRun && !isAdminCreating && (
          <p className="switch-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        )}
        {isFirstRun && (
          <p className="switch-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        )}
      </form>
    </div>
  );
}
