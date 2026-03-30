"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

const features = [
  {
    icon: "🛡️",
    title: "Secure Authentication",
    desc: "JWT-based login with Google OAuth. Your identity is always verified before access.",
    accent: "#6366f1",
  },
  {
    icon: "🔐",
    title: "AES-256 Encryption",
    desc: "Every saved password is encrypted at rest. Nobody reads your data but you.",
    accent: "#8b5cf6",
  },
  {
    icon: "📋",
    title: "Clean Vault",
    desc: "Add, edit, search, and delete credentials in a fast, distraction-free dashboard.",
    accent: "#10b981",
  },
  {
    icon: "👁️",
    title: "Show / Hide",
    desc: "Toggle password visibility instantly. Copy to clipboard with one click.",
    accent: "#06b6d4",
  },
];

const steps = [
  { num: "01", title: "Create an account", desc: "Sign up with email + OTP verification, or use Google." },
  { num: "02", title: "Login securely", desc: "Authenticate with JWT or Google OAuth in seconds." },
  { num: "03", title: "Add credentials", desc: "Store any site, username, and password in your vault." },
  { num: "04", title: "Access anytime", desc: "Search, copy, and manage your passwords from anywhere." },
];

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) router.replace("/Dashboard");
    else setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-bg">

      {/* Navbar */}
      <nav className="navbar sticky top-0 z-50 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo size={34} textSize="text-xl" />
          <div className="flex items-center gap-3">
            <Link href="/Login" className="btn-outline text-sm font-medium px-5 py-2 rounded-lg">
              Login
            </Link>
            <Link href="/Signup" className="btn-primary text-sm font-semibold px-5 py-2 rounded-lg">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-24 pb-28 text-center">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-400 mb-8"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <span className="accent-dot" />
            AES-256 Encrypted · Zero Knowledge
          </div>
        </div>

        <div className="animate-fade-in-up delay-100">
          <h1 className="text-5xl sm:text-7xl font-black text-white mb-4 tracking-tight leading-tight">
            Your Secure<br />
            <span className="gradient-text">Password Manager</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            SafeBuddy stores, encrypts, and organizes all your credentials in one place.
            Simple, fast, and built for people who take security seriously.
          </p>
        </div>

        <div className="animate-fade-in-up delay-200 flex items-center justify-center gap-4 flex-wrap">
          <Link href="/Login" className="btn-primary font-bold px-8 py-3.5 rounded-xl text-sm">
            Get Started Free →
          </Link>
          <Link href="/Signup" className="btn-outline font-semibold px-8 py-3.5 rounded-xl text-sm">
            Create Account
          </Link>
        </div>

        {/* Stats row */}
        <div className="animate-fade-in-up delay-300 mt-20 flex items-center justify-center gap-8 flex-wrap">
          {[["256-bit", "Encryption"], ["OTP", "Verified Signup"], ["Zero", "Plain Text Storage"]].map(([val, label]) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-black gradient-text">{val}</p>
              <p className="text-gray-500 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-8">
        <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, #1e1e2e, transparent)" }} />
      </div>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-24">
        <div className="text-center mb-14">
          <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Everything you need</h2>
          <p className="text-gray-500 max-w-sm mx-auto text-sm">Security and simplicity, without compromise.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className="card-feature rounded-xl p-6">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-white font-bold text-sm mb-2">{f.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-8">
        <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, #1e1e2e, transparent)" }} />
      </div>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-24">
        <div className="text-center mb-14">
          <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Up in four steps</h2>
          <p className="text-gray-500 text-sm">Simple from day one.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <div key={s.num} className="card rounded-xl p-6">
              <p className="text-4xl font-black gradient-text mb-4 leading-none">{s.num}</p>
              <h3 className="text-white font-bold text-sm mb-2">{s.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        <div className="box-frosted rounded-2xl p-10 sm:p-16 text-center relative overflow-hidden">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Start securing your passwords
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">
            Join SafeBuddy and never worry about forgetting or losing a password again.
          </p>
          <Link href="/Signup" className="btn-primary font-bold px-10 py-3.5 rounded-xl text-sm inline-flex">
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* About */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        <div className="box-frosted rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-black mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #6366f1, #10b981)" }}>
            K
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Created by <span className="gradient-text">K H A N</span>
          </h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
            Full-stack developer building secure, user-friendly web apps.
            SafeBuddy is powered by Next.js, Node.js, MongoDB, and AES-256 encryption.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-10" style={{ background: "rgba(99,102,241,0.05)", borderTop: "1px solid rgba(99,102,241,0.15)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col items-center gap-2">
          <Logo size={20} textSize="text-sm" />
          <p className="text-gray-600 text-xs">© 2026 SafeBuddy · Secure. Store. Simplify.</p>
        </div>
      </footer>
    </div>
  );
}
