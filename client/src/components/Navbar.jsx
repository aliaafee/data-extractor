import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <header className="topbar">
      <nav className="topbar-nav">
        <NavLink to="/projects" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Projects
        </NavLink>
        {isAdmin && (
          <NavLink to="/users" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            Users
          </NavLink>
        )}
      </nav>
      {isAdmin && <span className="role-badge">admin</span>}
      <span className="user-email">{user?.email}</span>
      <button className="btn-ghost" onClick={logout}>Sign out</button>
    </header>
  );
}
