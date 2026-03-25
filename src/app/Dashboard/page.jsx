"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const API = `${process.env.NEXT_PUBLIC_API_URL}/api/password`;

const emptyForm = { site: "", username: "", password: "" };

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

export default function Dashboard() {
  const router = useRouter();
  const [passwords, setPasswords] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [visibleIds, setVisibleIds] = useState(new Set());
  const [search, setSearch] = useState("");

  const fetchPasswords = useCallback(async () => {
    try {
      const res = await axios.get(API, { headers: getAuthHeader() });
      setPasswords(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/Login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/Login"); return; }
    fetchPasswords();
  }, [fetchPasswords, router]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editId) {
        const res = await axios.put(`${API}/${editId}`, form, { headers: getAuthHeader() });
        setPasswords(passwords.map((p) => (p._id === editId ? res.data : p)));
      } else {
        const res = await axios.post(`${API}/add`, form, { headers: getAuthHeader() });
        setPasswords([res.data, ...passwords]);
      }
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setForm({ site: item.site, username: item.username, password: item.password });
    setEditId(item._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this entry?")) return;
    try {
      await axios.delete(`${API}/${id}`, { headers: getAuthHeader() });
      setPasswords(passwords.filter((p) => p._id !== id));
    } catch {
      alert("Failed to delete");
    }
  };

  const toggleVisible = (id) => {
    setVisibleIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/Login");
  };

  const cancelForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
    setError("");
  };

  const filtered = passwords.filter((p) =>
    p.site.toLowerCase().includes(search.toLowerCase()) ||
    p.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="text-white font-bold text-lg tracking-tight">PassVault</span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          Log out
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Add / Edit Form */}
        {showForm ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
            <h2 className="text-white font-semibold mb-4">
              {editId ? "Edit entry" : "Add new password"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                name="site"
                required
                value={form.site}
                onChange={handleChange}
                placeholder="Website / App"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
              />
              <input
                name="username"
                required
                value={form.username}
                onChange={handleChange}
                placeholder="Username or email"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
              />
              <input
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
              />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition"
                >
                  {saving ? "Saving..." : editId ? "Update" : "Add password"}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full mb-8 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            <span className="text-xl leading-none">+</span> Add password
          </button>
        )}

        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by site or username..."
          className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition mb-4"
        />

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            {search ? "No results found." : "No passwords saved yet."}
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((item) => (
              <li
                key={item._id}
                className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{item.site}</p>
                    <p className="text-gray-400 text-sm truncate">{item.username}</p>
                    <p className="text-gray-500 text-sm font-mono mt-1">
                      {visibleIds.has(item._id) ? item.password : "••••••••••"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleVisible(item._id)}
                      className="text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
                    >
                      {visibleIds.has(item._id) ? "Hide" : "Show"}
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-xs text-red-400 hover:text-red-300 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
