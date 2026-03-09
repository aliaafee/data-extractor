import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <header className="flex items-center gap-4 px-6 py-3.5 bg-white border-b border-gray-200">
      <nav className="flex items-center gap-1 flex-1">
        <NavLink
          to="/projects"
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-lg text-sm font-medium no-underline transition-colors ${isActive ? "text-indigo-600 bg-violet-100" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`
          }
        >
          Projects
        </NavLink>
        {isAdmin && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium no-underline transition-colors ${isActive ? "text-indigo-600 bg-violet-100" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`
            }
          >
            Users
          </NavLink>
        )}
      </nav>
      {isAdmin && (
        <span className="text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded-full bg-violet-100 text-violet-800">
          admin
        </span>
      )}
      <span className="text-sm text-gray-600">{user?.email}</span>
      <button
        className="px-3 py-1.5 bg-transparent border border-gray-200 rounded-lg cursor-pointer text-sm text-gray-900 transition-colors hover:bg-gray-50"
        onClick={logout}
      >
        Sign out
      </button>
    </header>
  );
}
