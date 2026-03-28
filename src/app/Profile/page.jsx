"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = "/api/auth";

function getAuthHeader() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/Login"); return; }
    api.get(`${API}/me`)
      .then((res) => setUser(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/Login");
        }
      })
      .finally(() => setLoadingUser(false));
  }, [router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (form.newPassword !== form.confirmPassword) return setError("New passwords do not match");
    if (form.newPassword.length < 6) return setError("New password must be at least 6 characters");
    if (form.currentPassword === form.newPassword) return setError("New password must differ from current");
    setSaving(true);
    try {
      await api.put(`${API}/change-password`,
        { currentPassword: form.currentPassword, newPassword: form.newPassword }
      );
      setSuccess("Password updated successfully");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/Login");
  };

  const getInitials = (u) => {
    if (!u) return "?";
    const f = u.firstName?.[0] ?? "";
    const l = u.lastName?.[0] ?? "";
    return (f + l).toUpperCase() || "?";
  };

  const inputClass =
    "input-glow w-full rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none transition text-sm";

  const strength = (() => {
    const p = form.newPassword;
    if (!p) return null;
    if (p.length < 6) return { label: "Too short", color: "bg-red-500", w: "w-1/4" };
    if (p.length < 8) return { label: "Weak", color: "bg-orange-500", w: "w-2/4" };
    if (p.length < 12 || !/[^a-zA-Z0-9]/.test(p)) return { label: "Good", color: "bg-yellow-500", w: "w-3/4" };
    return { label: "Strong", color: "bg-green-500", w: "w-full" };
  })();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <nav className="relative z-20 glass border-b border-slate-700/30 px-4 py-3 sm:px-6 sm:py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/Dashboard" className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-white font-bold text-base sm:text-lg tracking-tight group-hover:text-indigo-400 transition">
              SafeBuddy
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/Dashboard"
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-white px-2.5 py-2 sm:px-4 rounded-xl transition"
              style={{ background: "rgba(30,41,59,0.9)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span className="hidden sm:inline">Vault</span>
            </Link>
            <button onClick={handleLogout}
              className="cursor-pointer flex items-center gap-2 text-sm text-slate-300 hover:text-white px-2.5 py-2 sm:px-4 rounded-xl transition"
              style={{ background: "rgba(30,41,59,0.9)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
        {loadingUser ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">Loading profile...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile hero */}
            <div className="glass rounded-3xl overflow-hidden">
              <div className="h-24 relative" style={{ zIndex: 0,
                background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>
                <div className="absolute inset-0"
                  style={{
                    backgroundImage: "linear-gradient(rgba(99,102,241,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.15) 1px, transparent 1px)",
                    backgroundSize: "32px 32px"
                  }} />
                <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)" }} />
              </div>
              <div className="px-4 sm:px-6 pb-6 relative" style={{ zIndex: 1 }}>
                <div className="flex items-end justify-between -mt-8 mb-4">
                  <div className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold select-none shadow-xl"
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      border: "3px solid #020817"
                    }}>
                    {getInitials(user)}
                  </div>

                </div>
                <h2 className="text-white text-xl font-bold">{user?.firstName} {user?.lastName}</h2>
                <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700/50">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">First name</p>
                    <p className="text-white text-sm font-medium">{user?.firstName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Last name</p>
                    <p className="text-white text-sm font-medium">{user?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Account type</p>
                    <p className="text-indigo-400 text-sm font-medium">SafeBuddy</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security card */}
            <div className="glass rounded-3xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Change password</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Keep your account secure with a strong password</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Current password
                  </label>
                  <div className="relative">
                    <input name="currentPassword" type={showCurrent ? "text" : "password"} required
                      value={form.currentPassword} onChange={handleChange}
                      placeholder="Enter current password" className={inputClass + " pr-16"}
                      style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(99,102,241,0.25)" }} />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                      className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white transition px-1">
                      {showCurrent ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    New password
                  </label>
                  <div className="relative">
                    <input name="newPassword" type={showNew ? "text" : "password"} required
                      value={form.newPassword} onChange={handleChange}
                      placeholder="Min. 6 characters" className={inputClass + " pr-16"}
                      style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(99,102,241,0.25)" }} />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white transition px-1">
                      {showNew ? "Hide" : "Show"}
                    </button>
                  </div>
                  {strength && (
                    <div className="mt-2">
                      <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.w}`} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{strength.label}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Confirm new password
                  </label>
                  <input name="confirmPassword" type={showNew ? "text" : "password"} required
                    value={form.confirmPassword} onChange={handleChange}
                    placeholder="Re-enter new password" className={inputClass}
                    style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(99,102,241,0.25)" }} />
                </div>

                {error && (
                  <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-400 text-sm">{error}</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2.5 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 text-green-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-400 text-sm">{success}</span>
                  </div>
                )}

                <button type="submit" disabled={saving}
                  className="cursor-pointer btn-primary w-full font-semibold py-3 rounded-xl text-sm"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Updating...
                    </span>
                  ) : "Update password"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
