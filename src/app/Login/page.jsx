"use client";
import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) return setError("All fields are required");

    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      router.push("/Dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 overflow-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-2">Sign in to your SafeBuddy account</p>
        </div>

        <div className="glass rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                Email address
              </label>
              <input name="email" type="email" required value={form.email} onChange={handleChange}
                placeholder="you@example.com" autoComplete="email"
                className="input-glow w-full rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none transition text-sm"
                style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(99,102,241,0.25)" }} />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input name="password" type={showPassword ? "text" : "password"} required
                  value={form.password} onChange={handleChange} placeholder="••••••••"
                  autoComplete="current-password"
                  className="input-glow w-full rounded-xl px-4 py-3 pr-16 text-white placeholder-slate-500 focus:outline-none transition text-sm"
                  style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(99,102,241,0.25)" }} />
                <button type="button" onClick={() => setShowPassword((s) => !s)}
                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white transition px-1">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 rounded-xl px-4 py-3"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full font-semibold py-3 rounded-xl text-sm cursor-pointer"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : "Sign in"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-slate-500 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/Signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
                Create one
              </Link>
            </p>
          </div>

          <div className="mt-4">
            <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`}
              className="flex items-center justify-center gap-3 w-full py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition"
              style={{ background: "rgba(30,41,59,0.9)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">Protected with AES-256 encryption</p>
      </div>
    </div>
  );
}
