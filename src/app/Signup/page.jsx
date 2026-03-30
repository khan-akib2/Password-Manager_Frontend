"use client";
import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

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
    if (!/[A-Z]/.test(password)) return setError("Password must contain at least one uppercase letter");
    if (!/[0-9]/.test(password)) return setError("Password must contain at least one number");
    if (!/[^a-zA-Z0-9]/.test(password)) return setError("Password must contain at least one symbol");
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

  const pwdRules = [
    { label: "8+ characters", ok: form.password.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(form.password) },
    { label: "Number", ok: /[0-9]/.test(form.password) },
    { label: "Symbol", ok: /[^a-zA-Z0-9]/.test(form.password) },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-up">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center mb-4">
            <Logo size={44} textSize="text-2xl" />
          </Link>
          <h1 className="text-2xl font-black text-white mt-4">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">Start managing your passwords securely</p>
        </div>

        <div className="rounded-2xl p-7" style={{ background: "#111118", border: "1px solid #1e1e2e" }}>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">First name</label>
                <input name="firstName" type="text" required value={form.firstName} onChange={handleChange}
                  placeholder="John" autoComplete="given-name" className="input-field" style={{ fontSize: "16px" }} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Last name</label>
                <input name="lastName" type="text" required value={form.lastName} onChange={handleChange}
                  placeholder="Doe" autoComplete="family-name" className="input-field" style={{ fontSize: "16px" }} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email</label>
              <div className="flex gap-2">
                <input name="email" type="email" required value={form.email} onChange={handleChange}
                  placeholder="you@example.com" autoComplete="email" className="input-field" style={{ fontSize: "16px" }} />
                <button type="button" onClick={handleSendOtp} disabled={sendingOtp || otpCooldown > 0}
                  className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold text-white cursor-pointer transition-all"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", opacity: (sendingOtp || otpCooldown > 0) ? 0.5 : 1, minWidth: "72px" }}>
                  {sendingOtp ? "..." : otpCooldown > 0 ? `${otpCooldown}s` : otpSent ? "Resend" : "Send OTP"}
                </button>
              </div>
              {otpSent && (
                <p className="text-emerald-400 text-xs mt-1.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  OTP sent to your email
                </p>
              )}
            </div>

            {otpSent && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Verification code</label>
                <input name="otp" type="text" inputMode="numeric" maxLength={6} required
                  value={form.otp} onChange={handleChange} placeholder="6-digit code" className="input-field" style={{ fontSize: "16px" }} />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input name="password" type={showPassword ? "text" : "password"} required
                  value={form.password} onChange={handleChange} placeholder="Min. 8 characters"
                  autoComplete="new-password" className="input-field pr-12" style={{ fontSize: "16px" }} />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition cursor-pointer">
                  {showPassword ? (
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
              </div>
              {form.password.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {pwdRules.map((r) => (
                    <span key={r.label} className={`text-xs px-2 py-0.5 rounded-full ${r.ok ? "text-emerald-400 bg-emerald-400/10" : "text-gray-600 bg-gray-800"}`}>
                      {r.ok ? "✓" : "○"} {r.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Confirm password</label>
              <input name="confirmPassword" type={showPassword ? "text" : "password"} required
                value={form.confirmPassword} onChange={handleChange}
                placeholder="Re-enter password" autoComplete="new-password"
                className="input-field" style={{ fontSize: "16px" }} />
            </div>

            <div className="flex items-start gap-3">
              <input id="terms" type="checkbox" required className="mt-0.5 w-4 h-4 accent-indigo-500 cursor-pointer" />
              <label htmlFor="terms" className="text-xs text-gray-500 leading-snug cursor-pointer">
                I agree to the <span className="text-indigo-400">Terms of Service</span> and <span className="text-indigo-400">Privacy Policy</span>
              </label>
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

            <button type="submit" disabled={loading}
              className="btn-primary w-full font-bold py-3 rounded-xl text-sm cursor-pointer">
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

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#1e1e2e]" />
            <span className="text-gray-600 text-xs">or</span>
            <div className="flex-1 h-px bg-[#1e1e2e]" />
          </div>

          <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`}
            className="btn-outline flex items-center justify-center gap-3 w-full py-3 rounded-xl text-sm font-medium cursor-pointer">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </a>

          <p className="text-center text-gray-600 text-sm mt-5">
            Already have an account?{" "}
            <Link href="/Login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-gray-700 text-xs mt-5">🔒 AES-256 encrypted · Secure. Store. Simplify.</p>
      </div>
    </div>
  );
}
