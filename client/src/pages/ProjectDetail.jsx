import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProject,
  updateProject,
  getItems,
  createItem,
  updateItem,
  deleteItem,
} from "../api";
import Navbar from "../components/Navbar";
import {
  ExtractionSchemaEditor,
  ExtractionSchemaView,
  generatePromptFromSchema,
} from "../components/ExtractionSchemaEditor";

export default function ProjectDetail() {
  const { id } = useParams();
  const projectId = Number(id);
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit project state
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    systemPrompt: "",
    userPromptTemplate: "",
    extractionSchema: [],
  });
  const [saving, setSaving] = useState(false);

  // New item state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    Promise.all([getProject(projectId), getItems(projectId)])
      .then(([proj, its]) => {
        setProject(proj);
        setForm({
          name: proj.name,
          systemPrompt: proj.systemPrompt ?? "",
          userPromptTemplate: proj.userPromptTemplate ?? "",
          extractionSchema: proj.extractionSchema ?? [],
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
        extractionSchema: form.extractionSchema.length > 0 ? form.extractionSchema : null,
      });
      setForm((f) => ({ ...f, extractionSchema: updated.extractionSchema ?? [] }));
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
      const item = await createItem(
        projectId,
        title.trim(),
        description.trim() || undefined,
      );
      setItems((prev) => [item, ...prev]);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggle(item) {
    try {
      const updated = await updateItem(projectId, item.id, {
        done: !item.done,
      });
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

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Loading…
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="max-w-2xl w-full mx-auto my-8 px-4">
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* Project header */}
        <div className="mb-6 flex flex-col gap-3">
          <button
            className="self-start px-3 py-1.5 bg-transparent border border-gray-200 rounded-lg cursor-pointer text-sm text-gray-900 transition-colors hover:bg-gray-50"
            onClick={() => navigate("/projects")}
          >
            ← Projects
          </button>
          {!editing ? (
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">{project?.name}</h1>
              <button
                className="px-3 py-1.5 bg-transparent border border-gray-200 rounded-lg cursor-pointer text-sm text-gray-900 transition-colors hover:bg-gray-50"
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
            </div>
          ) : (
            <form
              className="flex flex-col gap-3 bg-white border border-gray-200 rounded-lg p-5 mb-4"
              onSubmit={handleSaveProject}
            >
              <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-600">
                Name *
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  autoFocus
                  className="px-3 py-2 border border-gray-200 rounded-lg text-base font-sans text-gray-900 bg-gray-50 outline-none resize-y transition-colors focus:border-indigo-600 focus:bg-white"
                />
              </label>
              <ExtractionSchemaEditor
                value={form.extractionSchema}
                onChange={(schema) =>
                  setForm((f) => ({ ...f, extractionSchema: schema }))
                }
              />

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">System Prompt</span>
                </div>
                <textarea
                  value={form.systemPrompt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, systemPrompt: e.target.value }))
                  }
                  rows={3}
                  placeholder="You are a helpful assistant…"
                  className="px-3 py-2 border border-gray-200 rounded-lg font-mono text-gray-900 bg-gray-50 outline-none resize-y transition-colors focus:border-indigo-600 focus:bg-white"
                />
              </div>


              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">User Prompt Template</span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        userPromptTemplate: generatePromptFromSchema(f.extractionSchema),
                      }))
                    }
                    disabled={form.extractionSchema.length === 0}
                    className="px-3 py-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg cursor-pointer transition-colors hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Generate prompt from schema"
                  >
                    ↻ Generate from Schema
                  </button>
                </div>
                <textarea
                  value={form.userPromptTemplate}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      userPromptTemplate: e.target.value,
                    }))
                  }
                  rows={8}
                  placeholder="Summarise the following: {{input}}"
                  className="px-3 py-2 border border-gray-200 rounded-lg font-mono text-gray-900 bg-gray-50 outline-none resize-y transition-colors focus:border-indigo-600 focus:bg-white"
                />
              </div>

              

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 text-white border-none rounded-lg text-base cursor-pointer transition-colors hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-transparent border border-gray-200 rounded-lg cursor-pointer text-sm text-gray-900 transition-colors hover:bg-gray-50"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Items */}
        <h2 className="text-xs font-semibold mb-3 text-gray-600 uppercase tracking-wide">
          Items
        </h2>
        <form className="flex gap-2 mb-6 flex-wrap" onSubmit={handleCreateItem}>
          <input
            className="flex-1 min-w-[140px] px-3 py-2 border border-gray-200 rounded-lg text-base outline-none transition-colors focus:border-indigo-600"
            placeholder="New item title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            className="flex-1 min-w-[140px] px-3 py-2 border border-gray-200 rounded-lg text-base outline-none transition-colors focus:border-indigo-600"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 text-white border-none rounded-lg text-base cursor-pointer transition-colors hover:bg-indigo-700"
          >
            Add
          </button>
        </form>

        {items.length === 0 ? (
          <p className="text-gray-600 text-center mt-12">
            No items yet. Add one above!
          </p>
        ) : (
          <ul className="list-none flex flex-col gap-2">
            {items.map((item) => (
              <li
                key={item.id}
                className={`flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg transition-opacity ${item.done ? "opacity-55" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => handleToggle(item)}
                  className="w-4 h-4 cursor-pointer accent-indigo-600"
                />
                <div className="flex-1 flex flex-col gap-0.5">
                  <span
                    className={`font-medium ${item.done ? "line-through" : ""}`}
                  >
                    {item.title}
                  </span>
                  {item.description && (
                    <span className="text-xs text-gray-600">
                      {item.description}
                    </span>
                  )}
                </div>
                <button
                  className="bg-transparent border-none text-gray-600 cursor-pointer text-xs px-2 py-1 rounded transition-colors hover:text-red-500 hover:bg-red-50"
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
