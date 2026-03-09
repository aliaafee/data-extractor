import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listUsers, updateUserRole } from "../api";
import Navbar from "../components/Navbar";

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="max-w-2xl w-full mx-auto my-8 px-4">
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg">Users</h2>
          <Link
            to="/register"
            className="px-4 py-1.5 bg-indigo-600 text-white border-none rounded-lg text-sm font-medium no-underline cursor-pointer transition-colors hover:bg-indigo-700"
          >
            + Add User
          </Link>
        </div>
        {loading ? (
          <p className="flex justify-center items-center min-h-screen text-gray-500">
            Loading…
          </p>
        ) : (
          <ul className="list-none flex flex-col gap-2">
            {users.map((u) => (
              <li
                key={u.id}
                className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg transition-opacity"
              >
                <div className="flex-1 flex flex-col gap-0.5">
                  <span className="font-medium">{u.email}</span>
                  <span className="text-xs text-gray-600">
                    joined {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <select
                  className="px-1.5 py-1 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-900 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  disabled={u.id === user.id}
                  title={
                    u.id === user.id
                      ? "Can't change your own role"
                      : "Change role"
                  }
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
