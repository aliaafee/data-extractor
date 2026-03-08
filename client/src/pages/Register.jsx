import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { user, saveAuth } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If an admin is creating a user on behalf, redirect back to dashboard after
  const isAdminCreating = user?.role === 'admin';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await register(email, password, isAdminCreating ? role : undefined);
      if (!isAdminCreating) {
        // First-time bootstrap: log in as the new admin
        saveAuth(result.token, result.user);
        navigate('/');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>{isAdminCreating ? 'Create User' : 'Create Account'}</h1>
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
          {loading ? 'Saving…' : isAdminCreating ? 'Create User' : 'Register'}
        </button>
        {!isAdminCreating && (
          <p className="switch-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        )}
        {isAdminCreating && (
          <p className="switch-link">
            <Link to="/">← Back to dashboard</Link>
          </p>
        )}
      </form>
    </div>
  );
}
