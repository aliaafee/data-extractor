import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { user, setupRequired, saveAuth } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdminCreating = user?.role === "admin";
  const isFirstRun = setupRequired && !user;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await register(
        email,
        password,
        isAdminCreating ? role : undefined,
      );
      if (isFirstRun) {
        // Bootstrap: automatically sign in as the new admin
        saveAuth(result.token, result.user);
        navigate("/projects");
      } else {
        navigate("/projects");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const title = isFirstRun
    ? "Welcome — Create Admin Account"
    : isAdminCreating
      ? "Create User"
      : "Create Account";

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <form
        className="bg-white border border-gray-200 rounded-lg p-8 w-full max-w-md flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl">{title}</h1>
        {isFirstRun && (
          <p className="text-sm text-gray-600">
            No users exist yet. This account will be the administrator.
          </p>
        )}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-600">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="px-3 py-2 border border-gray-200 rounded-lg text-base text-gray-900 outline-none transition-colors focus:border-indigo-600"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-600">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="px-3 py-2 border border-gray-200 rounded-lg text-base text-gray-900 outline-none transition-colors focus:border-indigo-600"
          />
        </label>
        {isAdminCreating && (
          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-600">
            Role
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-base text-gray-900 bg-white outline-none"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-2.5 py-2.5 bg-indigo-600 text-white border-none rounded-lg text-base cursor-pointer transition-colors hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading
            ? "Saving…"
            : isFirstRun
              ? "Create Admin Account"
              : isAdminCreating
                ? "Create User"
                : "Register"}
        </button>
        {!isFirstRun && isAdminCreating && (
          <p className="text-sm text-gray-600 text-center">
            <Link
              to="/projects"
              className="text-indigo-600 no-underline hover:underline"
            >
              ← Back to dashboard
            </Link>
          </p>
        )}
        {!isFirstRun && !isAdminCreating && (
          <p className="text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-600 no-underline hover:underline"
            >
              Sign in
            </Link>
          </p>
        )}
        {isFirstRun && (
          <p className="text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-600 no-underline hover:underline"
            >
              Sign in
            </Link>
          </p>
        )}
      </form>
    </div>
  );
}
