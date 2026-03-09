import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { saveAuth, setupRequired } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect to setup wizard on first run
  useEffect(() => {
    if (setupRequired) navigate("/register", { replace: true });
  }, [setupRequired]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user, token } = await login(email, password);
      saveAuth(token, user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <form
        className="bg-white border border-gray-200 rounded-lg p-8 w-full max-w-md flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl">Sign In</h1>
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
            className="px-3 py-2 border border-gray-200 rounded-lg text-base text-gray-900 outline-none transition-colors focus:border-indigo-600"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="px-2.5 py-2.5 bg-indigo-600 text-white border-none rounded-lg text-base cursor-pointer transition-colors hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
