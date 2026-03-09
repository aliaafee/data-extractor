import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, updateProject, getItems, createItem, updateItem, deleteItem } from '../api';
import Navbar from '../components/Navbar';

export default function ProjectDetail() {
  const { id } = useParams();
  const projectId = Number(id);
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit project state
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', systemPrompt: '', userPromptTemplate: '' });
  const [saving, setSaving] = useState(false);

  // New item state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    Promise.all([getProject(projectId), getItems(projectId)])
      .then(([proj, its]) => {
        setProject(proj);
        setForm({
          name: proj.name,
          systemPrompt: proj.systemPrompt ?? '',
          userPromptTemplate: proj.userPromptTemplate ?? '',
        });
        setItems(its);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  async function handleSaveProject(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProject(projectId, {
        name: form.name.trim(),
        systemPrompt: form.systemPrompt.trim() || null,
        userPromptTemplate: form.userPromptTemplate.trim() || null,
      });
      setProject(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateItem(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const item = await createItem(projectId, title.trim(), description.trim() || undefined);
      setItems((prev) => [item, ...prev]);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggle(item) {
    try {
      const updated = await updateItem(projectId, item.id, { done: !item.done });
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteItem(itemId) {
    try {
      await deleteItem(projectId, itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="center">Loading…</div>;

  return (
    <div className="dashboard">
      <Navbar />
      <main className="content">
        {error && <p className="error">{error}</p>}

        {/* Project header */}
        <div className="project-detail-header">
          <button className="btn-ghost back-btn" onClick={() => navigate('/projects')}>
            ← Projects
          </button>
          {!editing ? (
            <div className="project-title-row">
              <h1 className="project-title">{project?.name}</h1>
              <button className="btn-ghost" onClick={() => setEditing(true)}>Edit</button>
            </div>
          ) : (
            <form className="project-form" onSubmit={handleSaveProject}>
              <label>
                Name *
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  autoFocus
                />
              </label>
              <label>
                System Prompt
                <textarea
                  value={form.systemPrompt}
                  onChange={(e) => setForm((f) => ({ ...f, systemPrompt: e.target.value }))}
                  rows={3}
                  placeholder="You are a helpful assistant…"
                />
              </label>
              <label>
                User Prompt Template
                <textarea
                  value={form.userPromptTemplate}
                  onChange={(e) => setForm((f) => ({ ...f, userPromptTemplate: e.target.value }))}
                  rows={3}
                  placeholder="Summarise the following: {{input}}"
                />
              </label>
              <div className="form-actions">
                <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          )}

          {/* {!editing && (project?.systemPrompt || project?.userPromptTemplate) && (
            <div className="prompt-preview">
              {project.systemPrompt && (
                <div className="prompt-block">
                  <span className="prompt-label">System Prompt</span>
                  <pre className="prompt-text">{project.systemPrompt}</pre>
                </div>
              )}
              {project.userPromptTemplate && (
                <div className="prompt-block">
                  <span className="prompt-label">User Prompt Template</span>
                  <pre className="prompt-text">{project.userPromptTemplate}</pre>
                </div>
              )}
            </div>
          )} */}
        </div>

        {/* Items */}
        <h2 className="section-title">Items</h2>
        <form className="create-form" onSubmit={handleCreateItem}>
          <input
            className="input-title"
            placeholder="New item title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            className="input-desc"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit">Add</button>
        </form>

        {items.length === 0 ? (
          <p className="empty">No items yet. Add one above!</p>
        ) : (
          <ul className="item-list">
            {items.map((item) => (
              <li key={item.id} className={`item-row${item.done ? ' done' : ''}`}>
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => handleToggle(item)}
                />
                <div className="item-text">
                  <span className="item-title">{item.title}</span>
                  {item.description && <span className="item-desc">{item.description}</span>}
                </div>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteItem(item.id)}
                  title="Delete"
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
