"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SchoolLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ schoolName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      localStorage.setItem(
        "dinocoach_user",
        JSON.stringify({
          type: "school",
          name: form.schoolName || form.email.split("@")[0],
          email: form.email,
        })
      );
      router.push("/school/dashboard");
    }, 800);
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
      style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a1000 50%, #0a0a0a 100%)" }}
    >
      <Link
        href="/login"
        className="absolute top-6 left-6 text-sm flex items-center gap-2 transition-colors"
        style={{ color: "#F5A623" }}
      >
        ← Back
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏫</div>
          <h1 className="text-3xl font-black text-white mb-1">
            Calgary <span style={{ color: "#F5A623" }}>School</span> Login
          </h1>
          <p className="text-gray-400 text-sm">Sign in to manage your coaching opportunities</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-8 border-2 space-y-5"
          style={{ backgroundColor: "#1a1a1a", borderColor: "#F5A623" }}
        >
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5A623" }}>
              School Name
            </label>
            <input
              type="text"
              placeholder="e.g. Forest Lawn High School"
              value={form.schoolName}
              onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 border border-gray-700 outline-none transition-colors"
              style={{ backgroundColor: "#0d0d0d" }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5A623" }}>
              School Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              placeholder="admin@school.cbe.ab.ca"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 border border-gray-700 outline-none transition-colors"
              style={{ backgroundColor: "#0d0d0d" }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5A623" }}>
              Password <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 border border-gray-700 outline-none transition-colors"
              style={{ backgroundColor: "#0d0d0d" }}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 px-4 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-black text-lg transition-all duration-200 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#F5A623", color: "#0a0a0a" }}
          >
            {loading ? "Signing in... 🏫" : "Sign In →"}
          </button>

          <p className="text-gray-600 text-xs text-center">
            Any credentials work — this is a demo login
          </p>
        </form>
      </div>
    </main>
  );
}
