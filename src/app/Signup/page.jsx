"use client";
import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "", otp: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const startCooldown = () => {
    setOtpCooldown(60);
    const t = setInterval(() => {
      setOtpCooldown((c) => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  };

  const handleSendOtp = async () => {
    setError("");
    const email = form.email.trim().toLowerCase();
    if (!email) return setError("Enter your email first");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Invalid email address");
    setSendingOtp(true);
    try {
      await api.post("/api/auth/send-otp", { email });
      setOtpSent(true);
      startCooldown();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim().toLowerCase();
    const { password, confirmPassword, otp } = form;

    if (!firstName || !lastName || !email || !password) return setError("All fields are required");
    if (password !== confirmPassword) return setError("Passwords do not match");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (!/[A-Z]/.test(password)) return setError("Password must contain at least one uppercase letter (A-Z)");
    if (!/[0-9]/.test(password)) return setError("Password must contain at least one number (0-9)");
    if (!/[^a-zA-Z0-9]/.test(password)) return setError("Password must contain at least one symbol (!@#$%^&*_-)");
    if (!otp) return setError("Enter the OTP sent to your email");

    setLoading(true);
    try {
      const res = await api.post("/api/auth/signup", { firstName, lastName, email, password, otp });
      localStorage.setItem("token", res.data.token);
      router.push("/Dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "input-glow w-full rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none transition text-sm";
  const inputStyle = { background: "rgba(15,23,42,0.9)", border: "1px solid rgba(99,102,241,0.25)", fontSize: "16px" };

  const pwdRules = [
    { label: "At least 8 characters", ok: form.password.length >= 8 },
    { label: "One uppercase letter (A-Z)", ok: /[A-Z]/.test(form.password) },
    { label: "One number (0-9)", ok: /[0-9]/.test(form.password) },
    { label: "One symbol (!@#$%^&*_-)", ok: /[^a-zA-Z0-9]/.test(form.password) },
  ];

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 py-12 overflow-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Create account</h1>
          <p className="text-slate-400 text-sm mt-2">Start managing your passwords securely</p>
        </div>

        <div className="glass rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">First name</label>
                <input name="firstName" type="text" required value={form.firstName}
                  onChange={handleChange} placeholder="John" autoComplete="given-name"
                  className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Last name</label>
                <input name="lastName" type="text" required value={form.lastName}
                  onChange={handleChange} placeholder="Doe" autoComplete="family-name"
                  className={inputClass} style={inputStyle} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Email address</label>
              <div className="flex gap-2">
                <input name="email" type="email" required value={form.email}
                  onChange={handleChange} placeholder="you@example.com" autoComplete="email"
                  className={inputClass} style={inputStyle} />
                <button type="button" onClick={handleSendOtp} disabled={sendingOtp || otpCooldown > 0}
                  className="shrink-0 px-3 py-2 rounded-xl text-xs font-semibold text-white transition"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", opacity: (sendingOtp || otpCooldown > 0) ? 0.6 : 1, minWidth: "80px" }}>
                  {sendingOtp ? "..." : otpCooldown > 0 ? `${otpCooldown}s` : otpSent ? "Resend" : "Send OTP"}
                </button>
              </div>
              {otpSent && <p className="text-green-400 text-xs mt-1">OTP sent to your email</p>}
            </div>

            {otpSent && (
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Verification code</label>
                <input name="otp" type="text" inputMode="numeric" maxLength={6} required
                  value={form.otp} onChange={handleChange} placeholder="6-digit code"
                  className={inputClass} style={inputStyle} />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input name="password" type={showPassword ? "text" : "password"} required
                  value={form.password} onChange={handleChange} placeholder="Min. 6 characters"
                  autoComplete="new-password" className={inputClass + " pr-16"} style={inputStyle} />
                <button type="button" onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white transition px-1">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {pwdRules.map((rule) => (
                    <div key={rule.label} className="flex items-center gap-2">
                      <svg className={`w-3.5 h-3.5 shrink-0 ${rule.ok ? "text-green-400" : "text-slate-600"}`} fill="currentColor" viewBox="0 0 20 20">
                        {rule.ok
                          ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        }
                      </svg>
                      <span className={`text-xs ${rule.ok ? "text-green-400" : "text-slate-500"}`}>{rule.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Confirm password</label>
              <input name="confirmPassword" type={showPassword ? "text" : "password"} required
                value={form.confirmPassword} onChange={handleChange}
                placeholder="Re-enter your password" autoComplete="new-password"
                className={inputClass} style={inputStyle} />
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input id="terms" type="checkbox" required
                className="mt-0.5 w-4 h-4 accent-indigo-500 cursor-pointer rounded" />
              <label htmlFor="terms" className="text-sm text-slate-400 leading-snug cursor-pointer">
                I agree to the <span className="text-indigo-400">Terms of Service</span> and <span className="text-indigo-400">Privacy Policy</span>
              </label>
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
              className="btn-primary w-full font-semibold py-3 rounded-xl text-sm mt-2"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : "Create account"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{" "}
              <Link href="/Login" className="text-indigo-400 hover:text-indigo-300 font-medium transition">Sign in</Link>
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
      </div>
    </div>
  );
}
