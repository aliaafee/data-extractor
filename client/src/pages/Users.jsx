import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listUsers, updateUserRole } from '../api';
import Navbar from '../components/Navbar';

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(userId, role) {
    try {
      const updated = await updateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="dashboard">
      <Navbar />
      <main className="content">
        {error && <p className="error">{error}</p>}
        <div className="users-header">
          <h2>Users</h2>
          <Link to="/register" className="btn-primary">+ Add User</Link>
        </div>
        {loading ? (
          <p className="center">Loading…</p>
        ) : (
          <ul className="item-list">
            {users.map((u) => (
              <li key={u.id} className="item-row">
                <div className="item-text">
                  <span className="item-title">{u.email}</span>
                  <span className="item-desc">
                    joined {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <select
                  className="role-select"
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  disabled={u.id === user.id}
                  title={u.id === user.id ? "Can't change your own role" : 'Change role'}
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
