"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

const API = "/api/auth";

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
    if (!user?.isGoogleUser && form.currentPassword === form.newPassword) return setError("New password must differ from current");
    setSaving(true);
    try {
      await api.put(`${API}/change-password`, { currentPassword: form.currentPassword, newPassword: form.newPassword });
      setSuccess("Password updated successfully");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => { localStorage.removeItem("token"); router.push("/Login"); };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await api.delete(`${API}/delete-account`);
      localStorage.removeItem("token");
      router.push("/Signup");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete account");
    }
  };

  const getInitials = (u) => {
    if (!u) return "?";
    return ((u.firstName?.[0] ?? "") + (u.lastName?.[0] ?? "")).toUpperCase() || "?";
  };

  const strength = (() => {
    const p = form.newPassword;
    if (!p) return null;
    if (p.length < 6) return { label: "Too short", color: "bg-red-500", w: "w-1/4" };
    if (p.length < 8) return { label: "Weak", color: "bg-orange-500", w: "w-2/4" };
    if (p.length < 12 || !/[^a-zA-Z0-9]/.test(p)) return { label: "Good", color: "bg-yellow-500", w: "w-3/4" };
    return { label: "Strong", color: "bg-green-500", w: "w-full" };
  })();

  const inp = "input-field";

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-bg">

      {/* Navbar */}
      <nav className="navbar sticky top-0 z-20 px-4 sm:px-6 py-3.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/Dashboard"><Logo size={30} textSize="text-base" /></Link>
          <div className="flex items-center gap-2">
            <Link href="/Dashboard" className="btn-outline flex items-center gap-2 text-sm px-3 py-2 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span className="hidden sm:inline">Vault</span>
            </Link>
            <button onClick={handleLogout} className="btn-outline flex items-center gap-2 text-sm px-3 py-2 rounded-lg cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {loadingUser ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 text-sm">Loading profile...</p>
          </div>
        ) : (
          <div className="space-y-5">

            {/* Profile card */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="h-20 relative"
                style={{ background: "linear-gradient(135deg, #0f0f1a, #1a1040, #0f0f1a)",
                  backgroundImage: "linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)",
                  backgroundSize: "32px 32px" }} />
              <div className="px-5 pb-5">
                <div className="-mt-8 mb-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black"
                    style={{ background: "linear-gradient(135deg, #6366f1, #10b981)", border: "3px solid #0a0a0f" }}>
                    {getInitials(user)}
                  </div>
                </div>
                <h2 className="text-white text-lg font-bold">{user?.firstName} {user?.lastName}</h2>
                <p className="text-gray-500 text-sm mt-0.5">{user?.email}</p>
                <div className="grid grid-cols-3 gap-4 mt-5 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  {[["First name", user?.firstName], ["Last name", user?.lastName], ["Account", "SafeBuddy"]].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">{label}</p>
                      <p className="text-white text-sm font-medium">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Change password */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.2)" }}>
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Change password</h3>
                  <p className="text-gray-600 text-xs mt-0.5">Keep your account secure</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {user?.isGoogleUser && (
                  <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm text-indigo-300"
                    style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    You signed up with Google. Set a password to enable email login too.
                  </div>
                )}

                {!user?.isGoogleUser && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Current password</label>
                    <div className="relative">
                      <input name="currentPassword" type={showCurrent ? "text" : "password"} required
                        value={form.currentPassword} onChange={handleChange}
                        placeholder="Enter current password" className={inp + " pr-16"} />
                      <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white transition cursor-pointer px-1">
                        {showCurrent ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">New password</label>
                  <div className="relative">
                    <input name="newPassword" type={showNew ? "text" : "password"} required
                      value={form.newPassword} onChange={handleChange}
                      placeholder="Min. 6 characters" className={inp + " pr-16"} />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white transition cursor-pointer px-1">
                      {showNew ? "Hide" : "Show"}
                    </button>
                  </div>
                  {strength && (
                    <div className="mt-2">
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: "#1e1e2e" }}>
                        <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.w}`} />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{strength.label}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Confirm new password</label>
                  <input name="confirmPassword" type={showNew ? "text" : "password"} required
                    value={form.confirmPassword} onChange={handleChange}
                    placeholder="Re-enter new password" className={inp} />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-400"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-emerald-400"
                    style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {success}
                  </div>
                )}

                <button type="submit" disabled={saving} className="btn-primary w-full font-bold py-3 rounded-xl text-sm cursor-pointer">
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

            {/* Danger zone */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Delete account</h3>
                  <p className="text-gray-600 text-xs mt-0.5">Permanently removes your account and all saved passwords</p>
                </div>
              </div>
              <button onClick={handleDeleteAccount}
                className="w-full font-bold py-3 rounded-xl text-sm cursor-pointer transition-all hover:opacity-90"
                style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
                Delete my account
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
