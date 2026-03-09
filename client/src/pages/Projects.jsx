import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, createProject, deleteProject } from '../api';
import Navbar from '../components/Navbar';

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create form
  const [name, setName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [userPromptTemplate, setUserPromptTemplate] = useState('');
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
      setName('');
      setSystemPrompt('');
      setUserPromptTemplate('');
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(e, id) {
    e.stopPropagation();
    if (!confirm('Delete this project and all its items?')) return;
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
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
          <h2>Projects</h2>
          <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : '+ New Project'}
          </button>
        </div>

        {showForm && (
          <form className="project-form" onSubmit={handleCreate}>
            <label>
              Name *
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My project"
                required
                autoFocus
              />
            </label>
            <label>
              System Prompt
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="You are a helpful assistant…"
                rows={3}
              />
            </label>
            <label>
              User Prompt Template
              <textarea
                value={userPromptTemplate}
                onChange={(e) => setUserPromptTemplate(e.target.value)}
                placeholder="Summarise the following: {{input}}"
                rows={3}
              />
            </label>
            <div className="form-actions">
              <button type="submit" disabled={saving}>
                {saving ? 'Creating…' : 'Create Project'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="center">Loading…</p>
        ) : projects.length === 0 ? (
          <p className="empty">No projects yet. Create one above!</p>
        ) : (
          <ul className="project-list">
            {projects.map((p) => (
              <li
                key={p.id}
                className="project-card"
                onClick={() => navigate(`/projects/${p.id}`)}
              >
                <div className="project-info">
                  <span className="project-name">{p.name}</span>
                  <span className="item-desc">
                    {p._count?.items ?? 0} item{p._count?.items !== 1 ? 's' : ''} ·{' '}
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  className="btn-delete"
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
