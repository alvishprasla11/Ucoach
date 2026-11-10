"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "../../../components/AuthShell";

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
    <AuthShell
      back="/login"
      backLabel="All log in options"
      side={{ title: "Find a coach for your team.", points: ["Post sport, grade and schedule", "Review Dinos athlete applicants", "Free for Calgary schools"] }}
    >
      <h1 className="text-4xl font-bold">School log in</h1>
      <p className="mt-2 text-muted">Manage your coaching postings.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            School Name
          </label>
          <input
            type="text"
            placeholder="e.g. Forest Lawn High School"
            value={form.schoolName}
            onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
            className="field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            School Email <span className="text-red">*</span>
          </label>
          <input
            type="email"
            placeholder="admin@school.cbe.ab.ca"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
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
