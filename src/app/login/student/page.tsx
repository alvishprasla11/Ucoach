"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "../../../components/AuthShell";

export default function StudentLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", name: "", ucid: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    // Simulate a brief login — no real auth needed
    setTimeout(() => {
      // Store a simple session in localStorage
      localStorage.setItem(
        "dinocoach_user",
        JSON.stringify({
          type: "student",
          name: form.name || form.email.split("@")[0],
          email: form.email,
          ucid: form.ucid,
        })
      );
      router.push("/student/dashboard");
    }, 800);
  };

  return (
    <AuthShell
      back="/login"
      backLabel="All log in options"
      side={{ title: "Coach a team near you.", points: ["Browse open teams across Calgary", "Pick the sport and nights that fit", "Build leadership and volunteer hours"] }}
    >
      <h1 className="text-4xl font-bold">Student log in</h1>
      <p className="mt-2 text-muted">Sign in with your UCalgary details.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Full Name
          </label>
          <input
            type="text"
            placeholder="e.g. Alex Johnson"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            UCalgary Email <span className="text-red">*</span>
          </label>
          <input
            type="email"
            placeholder="student@ucalgary.ca"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            UCID (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. 30123456"
            value={form.ucid}
            onChange={(e) => setForm({ ...form, ucid: e.target.value })}
            className="field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Password <span className="text-red">*</span>
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="field"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red/10 px-4 py-2 text-sm text-red-deep">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-60">
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-center text-xs text-muted">
          Demo build: any credentials work.
        </p>
      </form>
    </AuthShell>
  );
}
