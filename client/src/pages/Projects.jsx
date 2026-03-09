import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects, createProject, deleteProject } from "../api";
import Navbar from "../components/Navbar";

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create form
  const [name, setName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userPromptTemplate, setUserPromptTemplate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const project = await createProject({
        name: name.trim(),
        systemPrompt: systemPrompt.trim() || undefined,
        userPromptTemplate: userPromptTemplate.trim() || undefined,
      });
      setProjects((prev) => [project, ...prev]);
      setName("");
      setSystemPrompt("");
      setUserPromptTemplate("");
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(e, id) {
    e.stopPropagation();
    if (!confirm("Delete this project and all its items?")) return;
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
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
          <h2 className="text-lg">Projects</h2>
          <button
            className="px-4 py-1.5 bg-indigo-600 text-white border-none rounded-lg text-sm font-medium no-underline cursor-pointer transition-colors hover:bg-indigo-700"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? "Cancel" : "+ New Project"}
          </button>
        </div>

        {showForm && (
          <form
            className="flex flex-col gap-3 bg-white border border-gray-200 rounded-lg p-5 mb-4"
            onSubmit={handleCreate}
          >
            <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-600">
              Name *
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My project"
                required
                autoFocus
                className="px-3 py-2 border border-gray-200 rounded-lg text-base font-sans text-gray-900 bg-gray-50 outline-none resize-y transition-colors focus:border-indigo-600 focus:bg-white"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-600">
              System Prompt
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="You are a helpful assistant…"
                rows={3}
                className="px-3 py-2 border border-gray-200 rounded-lg text-base font-sans text-gray-900 bg-gray-50 outline-none resize-y transition-colors focus:border-indigo-600 focus:bg-white"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-600">
              User Prompt Template
              <textarea
                value={userPromptTemplate}
                onChange={(e) => setUserPromptTemplate(e.target.value)}
                placeholder="Summarise the following: {{input}}"
                rows={3}
                className="px-3 py-2 border border-gray-200 rounded-lg text-base font-sans text-gray-900 bg-gray-50 outline-none resize-y transition-colors focus:border-indigo-600 focus:bg-white"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-indigo-600 text-white border-none rounded-lg text-base cursor-pointer transition-colors hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Creating…" : "Create Project"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="flex justify-center items-center min-h-screen text-gray-500">
            Loading…
          </p>
        ) : projects.length === 0 ? (
          <p className="text-gray-600 text-center mt-12">
            No projects yet. Create one above!
          </p>
        ) : (
          <ul className="list-none flex flex-col gap-2">
            {projects.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 px-5 py-4 bg-white border border-gray-200 rounded-lg cursor-pointer transition-all hover:border-indigo-600 hover:shadow-[0_0_0_3px_#ede9fe]"
                onClick={() => navigate(`/projects/${p.id}`)}
              >
                <div className="flex-1 flex flex-col gap-1">
                  <span className="font-semibold text-base">{p.name}</span>
                  <span className="text-xs text-gray-600">
                    {p._count?.items ?? 0} item
                    {p._count?.items !== 1 ? "s" : ""} ·{" "}
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  className="bg-transparent border-none text-gray-600 cursor-pointer text-xs px-2 py-1 rounded transition-colors hover:text-red-500 hover:bg-red-50"
                  onClick={(e) => handleDelete(e, p.id)}
                  title="Delete project"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
