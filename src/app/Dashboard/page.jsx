"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

const API = "/api/password";
const emptyForm = { site: "", username: "", password: "" };

function SiteIcon({ site }) {
  const letter = site ? site.replace(/https?:\/\//, "").charAt(0).toUpperCase() : "?";
  const colors = [
    ["#6366f1","#8b5cf6"], ["#2563eb","#06b6d4"],
    ["#059669","#10b981"], ["#ea580c","#f59e0b"],
    ["#db2777","#e11d48"], ["#7c3aed","#6366f1"],
  ];
  const [from, to] = colors[letter.charCodeAt(0) % colors.length];
  return (
    <div style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 select-none">
      {letter}
    </div>
  );
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
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchPasswords = useCallback(async () => {
    try {
      const res = await api.get(API);
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
    const payload = { site: form.site.trim(), username: form.username.trim(), password: form.password };
    if (!payload.site || !payload.username || !payload.password) {
      setError("All fields are required");
      setSaving(false);
      return;
    }
    try {
      if (editId) {
        const res = await api.put(`${API}/${editId}`, payload);
        setPasswords(passwords.map((p) => (p._id === editId ? res.data : p)));
      } else {
        const res = await api.post(`${API}/add`, payload);
        setPasswords([res.data, ...passwords]);
      }
      setForm(emptyForm); setEditId(null); setShowForm(false); setShowFormPassword(false);
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
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
      return;
    }
    setDeleteConfirmId(null);
    try {
      await api.delete(`${API}/${id}`);
      setPasswords(passwords.filter((p) => p._id !== id));
    } catch { setError("Failed to delete"); }
  };

  const toggleVisible = (id) => {
    setVisibleIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const copyPassword = (id, pw) => {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(pw).catch(() => {});
    else {
      const el = document.createElement("textarea");
      el.value = pw; el.style.position = "fixed"; el.style.opacity = "0";
      document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const cancelForm = () => { setForm(emptyForm); setEditId(null); setShowForm(false); setError(""); setShowFormPassword(false); };
  const handleLogout = () => { localStorage.removeItem("token"); router.push("/Login"); };

  const filtered = passwords.filter((p) =>
    p.site.toLowerCase().includes(search.toLowerCase()) ||
    p.username.toLowerCase().includes(search.toLowerCase())
  );

  const inp = "input-field";
  const inpStyle = { fontSize: "16px" };

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-bg">

      {/* Navbar */}
      <nav className="navbar sticky top-0 z-20 px-4 sm:px-6 py-3.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Logo size={30} textSize="text-base" />
          <div className="flex items-center gap-2">
            <Link href="/Profile"
              className="btn-outline flex items-center gap-2 text-sm px-3 py-2 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden sm:inline">Profile</span>
            </Link>
            <button onClick={handleLogout}
              className="btn-outline flex items-center gap-2 text-sm px-3 py-2 rounded-lg cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-7 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Your Vault</h1>
            <p className="text-gray-500 text-sm mt-0.5">{passwords.length} credential{passwords.length !== 1 ? "s" : ""} stored</p>
          </div>
          {!showForm && (
            <button onClick={() => setShowForm(true)}
              className="btn-primary font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add new
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="rounded-2xl p-5 mb-6" style={{ background: "#111118", border: "1px solid rgba(99,102,241,0.3)", animation: "formSlideIn 0.25s ease forwards" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-sm">{editId ? "Edit credential" : "Add new credential"}</h2>
              <button onClick={cancelForm} className="text-gray-500 hover:text-white transition cursor-pointer p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input name="site" required value={form.site} onChange={handleChange}
                placeholder="Website or App name" className={inp} style={inpStyle} />
              <input name="username" required value={form.username} onChange={handleChange}
                placeholder="Username or email" className={inp} style={inpStyle} />
              <div className="relative">
                <input name="password" required value={form.password} onChange={handleChange}
                  type={showFormPassword ? "text" : "password"} placeholder="Password"
                  className={inp + " pr-16"} style={inpStyle} />
                <button type="button" onClick={() => setShowFormPassword(!showFormPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white transition cursor-pointer px-1">
                  {showFormPassword ? "Hide" : "Show"}
                </button>
              </div>
              {error && (
                <div className="text-red-400 text-sm px-3 py-2 rounded-lg"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  {error}
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving}
                  className="btn-primary flex-1 font-semibold py-2.5 rounded-xl text-sm cursor-pointer">
                  {saving ? "Saving..." : editId ? "Update" : "Save"}
                </button>
                <button type="button" onClick={cancelForm}
                  className="btn-outline px-5 rounded-xl text-sm cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-5">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by site or username..."
            className="input-field pl-10" />
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 text-sm">Loading vault...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "#111118", border: "1px solid #1e1e2e" }}>
              <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-gray-400 font-semibold text-sm">{search ? "No results found" : "Vault is empty"}</p>
            <p className="text-gray-600 text-xs mt-1">{search ? "Try a different search" : "Add your first credential to get started"}</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {filtered.map((item) => (
              <li key={item._id} className="card rounded-xl px-4 py-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <SiteIcon site={item.site} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{item.site}</p>
                      <p className="text-gray-500 text-xs truncate mt-0.5">{item.username}</p>
                      <p className="text-gray-600 text-xs font-mono mt-1">
                        {visibleIds.has(item._id) ? item.password : "••••••••••••"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Toggle visibility */}
                    <button onClick={() => toggleVisible(item._id)}
                      className="p-2 text-gray-500 hover:text-white rounded-lg transition cursor-pointer"
                      style={{ background: "#1a1a24" }}>
                      {visibleIds.has(item._id) ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                    {/* Copy */}
                    <button onClick={() => copyPassword(item._id, item.password)}
                      className="p-2 text-gray-500 hover:text-white rounded-lg transition cursor-pointer"
                      style={{ background: "#1a1a24" }}>
                      {copiedId === item._id ? (
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                    {/* Edit */}
                    <button onClick={() => handleEdit(item)}
                      className="p-2 text-indigo-400 hover:text-indigo-300 rounded-lg transition cursor-pointer"
                      style={{ background: "#1a1a24" }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {/* Delete */}
                    <button onClick={() => handleDelete(item._id)}
                      className="p-2 rounded-lg transition cursor-pointer text-sm font-medium"
                      style={{
                        background: deleteConfirmId === item._id ? "rgba(239,68,68,0.15)" : "#1a1a24",
                        color: "#f87171",
                        border: deleteConfirmId === item._id ? "1px solid rgba(239,68,68,0.3)" : "1px solid transparent",
                        minWidth: deleteConfirmId === item._id ? "72px" : "auto",
                        padding: deleteConfirmId === item._id ? "0.5rem 0.75rem" : "0.5rem",
                      }}>
                      {deleteConfirmId === item._id ? "Confirm?" : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
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
