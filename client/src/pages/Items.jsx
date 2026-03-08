import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getItems, createItem, updateItem, deleteItem } from '../api';
import Navbar from '../components/Navbar';

export default function Items() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [itemsLoading, setItemsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getItems()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setItemsLoading(false));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const item = await createItem(title.trim(), description.trim() || undefined);
      setItems((prev) => [item, ...prev]);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggle(item) {
    try {
      const updated = await updateItem(item.id, { done: !item.done });
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="dashboard">
      <Navbar />
      <main className="content">
        {error && <p className="error">{error}</p>}
        <form className="create-form" onSubmit={handleCreate}>
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

            {itemsLoading ? (
              <p className="center">Loading…</p>
            ) : items.length === 0 ? (
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
                      {item.description && (
                        <span className="item-desc">{item.description}</span>
                      )}
                    </div>
                    <button className="btn-delete" onClick={() => handleDelete(item.id)} title="Delete">✕</button>
                  </li>
                ))}
              </ul>
            )}
      </main>
    </div>
  );
}
