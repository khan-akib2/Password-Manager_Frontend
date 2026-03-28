"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = "/api/password";
const emptyForm = { site: "", username: "", password: "" };

function getAuthHeader() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

function SiteIcon({ site }) {
  const letter = site ? site.replace(/https?:\/\//, "").charAt(0).toUpperCase() : "?";
  const colors = [
    ["#7c3aed","#9333ea"], ["#2563eb","#0891b2"],
    ["#059669","#0d9488"], ["#ea580c","#dc2626"],
    ["#db2777","#e11d48"], ["#4f46e5","#2563eb"],
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
    // trim inputs before sending
    const payload = {
      site: form.site.trim(),
      username: form.username.trim(),
      password: form.password,
    };
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
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
      setShowFormPassword(false);
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
    } catch {
      setError("Failed to delete entry");
    }
  };

  const toggleVisible = (id) => {
    setVisibleIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Clipboard with fallback for HTTP/older browsers
  const copyPassword = (id, pw) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(pw).catch(() => {});
    } else {
      const el = document.createElement("textarea");
      el.value = pw;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const cancelForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
    setError("");
    setShowFormPassword(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/Login");
  };

  const filtered = passwords.filter((p) =>
    p.site.toLowerCase().includes(search.toLowerCase()) ||
    p.username.toLowerCase().includes(search.toLowerCase())
  );

  const inp = "input-glow w-full rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none transition text-sm";
  const inpStyle = { background: "rgba(15,23,42,0.9)", border: "1px solid rgba(99,102,241,0.25)" };
  const btnStyle = { background: "rgba(30,41,59,0.9)", border: "1px solid rgba(99,102,241,0.2)" };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Navbar */}
      <nav className="relative z-20 glass border-b border-slate-700/30 px-4 py-3 sm:px-6 sm:py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-white font-bold text-base sm:text-lg tracking-tight">SafeBuddy</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Icon-only on mobile, icon+text on sm+ */}
            <Link href="/Profile"
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-white px-2.5 py-2 sm:px-4 rounded-xl transition"
              style={{ background: "rgba(30,41,59,0.9)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden sm:inline">Profile</span>
            </Link>
            <button onClick={handleLogout}
              className="cursor-pointer flex items-center gap-2 text-sm text-slate-300 hover:text-white px-2.5 py-2 sm:px-4 rounded-xl transition"
              style={{ background: "rgba(30,41,59,0.9)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Your Vault</h1>
          <p className="text-slate-400 text-sm">{passwords.length} password{passwords.length !== 1 ? "s" : ""} stored securely</p>
        </div>

        {/* Add button */}
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="cursor-pointer btn-primary w-full font-semibold py-3.5 rounded-2xl text-sm mb-6 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add new password
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="rounded-2xl p-4 sm:p-6 mb-6"
            style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(99,102,241,0.3)", boxShadow: "0 0 40px rgba(99,102,241,0.12)", animation: "formSlideIn 0.3s cubic-bezier(0.4,0,0.2,1) forwards" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold text-base">{editId ? "Edit entry" : "Add new password"}</h2>
              <button onClick={cancelForm} className="p-1.5 text-slate-500 hover:text-white rounded-lg transition" style={{ background: "rgba(30,41,59,0.8)" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input name="site" required value={form.site} onChange={handleChange} placeholder="Website or App name" className={inp} style={inpStyle} />
              <input name="username" required value={form.username} onChange={handleChange} placeholder="Username or email" className={inp} style={inpStyle} />
              <div className="relative">
                <input name="password" required value={form.password} onChange={handleChange}
                  type={showFormPassword ? "text" : "password"} placeholder="Password"
                  className= {inp + " pr-16"} style={inpStyle} />
                <button type="button" onClick={() => setShowFormPassword(!showFormPassword)}
                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white transition px-1">
                  {showFormPassword ? "Hide" : "Show"}
                </button>
              </div>
              {error && (
                <div className="flex items-center gap-2 rounded-xl px-4 py-2.5" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving}
                  className="cursor-pointer btn-primary flex-1 font-semibold py-3 rounded-xl text-sm"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                  {saving ? "Saving..." : editId ? "Update entry" : "Save password"}
                </button>
                <button type="button" onClick={cancelForm}
                  className="cursor-pointer px-5 text-slate-300 hover:text-white rounded-xl transition text-sm" style={btnStyle}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-5">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search passwords..."
            className="input-glow w-full rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none transition text-sm"
            style={{ background: "rgba(15,23,42,0.85)", border: "1px solid rgba(99,102,241,0.2)" }} />
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">Loading your vault...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(15,23,42,0.85)", border: "1px solid rgba(99,102,241,0.15)" }}>
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium">{search ? "No results found" : "Your vault is empty"}</p>
            <p className="text-slate-600 text-sm mt-1">{search ? "Try a different search term" : "Add your first password to get started"}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((item, i) => (
              <li key={item._id} className="card-hover rounded-2xl px-5 py-4"
                style={{ background: "rgba(15,23,42,0.85)", border: "1px solid rgba(99,102,241,0.15)" }}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <SiteIcon site={item.site} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{item.site}</p>
                      <p className="text-slate-400 text-xs truncate mt-0.5">{item.username}</p>
                      <p className="text-slate-500 text-xs font-mono mt-1 tracking-wider">
                        {visibleIds.has(item._id) ? item.password : "••••••••••••"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 pl-0 sm:pl-2">
                    <button onClick={() => toggleVisible(item._id)} title={visibleIds.has(item._id) ? "Hide" : "Show"}
                      className="cursor-pointer p-2 text-slate-400 hover:text-white rounded-lg transition" style={{ background: "rgba(30,41,59,0.8)" }}>
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
                    <button onClick={() => copyPassword(item._id, item.password)} title="Copy"
                      className="cursor-pointer p-2 text-slate-400 hover:text-white rounded-lg transition" style={{ background: "rgba(30,41,59,0.8)" }}>
                      {copiedId === item._id ? (
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                    <button onClick={() => handleEdit(item)} title="Edit"
                      className="cursor-pointer p-2 text-indigo-400 hover:text-indigo-300 rounded-lg transition" style={{ background: "rgba(30,41,59,0.8)" }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(item._id)} title="Delete"
                      className="cursor-pointer p-2 rounded-lg transition text-sm font-medium px-3"
                      style={{
                        background: deleteConfirmId === item._id ? "rgba(239,68,68,0.2)" : "rgba(30,41,59,0.8)",
                        color: deleteConfirmId === item._id ? "#f87171" : "#f87171",
                        border: deleteConfirmId === item._id ? "1px solid rgba(239,68,68,0.4)" : "none",
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
