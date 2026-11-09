"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  type: string;
  name: string;
  email: string;
}

const SPORTS = ["Basketball", "Football", "Flag Football", "Girls Basketball", "Other"];
const SCHOOL_LEVELS = ["Elementary (K-6)", "Middle School (7-9)", "High School (10-12)"];

export default function SchoolDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [myPostings, setMyPostings] = useState<unknown[]>([]);

  const [form, setForm] = useState({
    school_name: "",
    school_email: "",
    school_level: "",
    sport: "",
    team_name: "",
    description: "",
    schedule: "",
    contact_name: "",
    contact_email: "",
    num_coaches_needed: 1,
  });

  useEffect(() => {
    const stored = localStorage.getItem("dinocoach_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(stored) as User;
    if (parsed.type !== "school") {
      router.push("/login");
      return;
    }
    setUser(parsed);
    // Pre-fill school info
    setForm((f) => ({
      ...f,
      school_name: parsed.name || "",
      school_email: parsed.email || "",
      contact_email: parsed.email || "",
    }));

    // Load existing postings
    fetchPostings();
  }, [router]);

  const fetchPostings = async () => {
    try {
      const res = await fetch("/api/postings");
      const data = await res.json() as { postings: unknown[] };
      setMyPostings(data.postings || []);
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess("");

    try {
      const res = await fetch("/api/postings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSuccess("✅ Your coaching opportunity has been posted!");
        setShowForm(false);
        fetchPostings();
        // Reset form fields (keep school info)
        setForm((f) => ({
          ...f,
          sport: "",
          team_name: "",
          school_level: "",
          description: "",
          schedule: "",
          contact_name: "",
          num_coaches_needed: 1,
        }));
      } else {
        const err = await res.json() as { error?: string };
        setSuccess("❌ Error: " + (err.error || "Unknown error"));
      }
    } catch {
      setSuccess("❌ Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("dinocoach_user");
    router.push("/");
  };

  if (!user) return null;

  interface Posting {
    id: number;
    school_name: string;
    sport: string;
    school_level: string;
    team_name?: string;
    num_coaches_needed: number;
    description: string;
    schedule: string;
    contact_name: string;
    contact_email: string;
    created_at: string;
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#0a0a0a" }}>
      {/* Navbar */}
      <nav
        className="w-full px-6 py-4 flex items-center justify-between shadow-lg"
        style={{ backgroundColor: "#CC0000" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏫</span>
          <div>
            <span className="text-white font-bold text-lg">
              Dino<span style={{ color: "#F5A623" }}>Coach</span>
            </span>
            <p className="text-red-200 text-xs">{user.name} · School Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-red-200 text-sm hover:text-white">
            Switch Account
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full text-sm font-semibold text-red-100 border border-red-300 hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">
              Welcome, <span style={{ color: "#F5A623" }}>{user.name}</span> 🏫
            </h1>
            <p className="text-gray-400">
              Post coaching volunteer opportunities for your school&apos;s sports teams
            </p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setSuccess(""); }}
            className="px-6 py-3 rounded-full font-bold transition-all duration-200 hover:scale-105"
            style={{ backgroundColor: showForm ? "#555" : "#CC0000", color: "white" }}
          >
            {showForm ? "✕ Cancel" : "+ Post New Opportunity"}
          </button>
        </div>

        {/* Success message */}
        {success && (
          <div
            className="mb-6 px-5 py-4 rounded-xl text-sm font-semibold"
            style={{
              backgroundColor: success.startsWith("✅") ? "#1a3a1a" : "#3a1a1a",
              color: success.startsWith("✅") ? "#4ade80" : "#f87171",
              border: `1px solid ${success.startsWith("✅") ? "#166534" : "#991b1b"}`,
            }}
          >
            {success}
          </div>
        )}

        {/* Post Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl p-8 border-2 mb-10 space-y-5"
            style={{ backgroundColor: "#1a1a1a", borderColor: "#CC0000" }}
          >
            <h2 className="text-xl font-black text-white mb-2">
              🏀 New Coaching Opportunity
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#F5A623" }}>
                  School Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.school_name}
                  onChange={(e) => setForm({ ...form, school_name: e.target.value })}
                  required
                  placeholder="Forest Lawn High School"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 border border-gray-700 outline-none focus:border-red-500 transition-colors"
                  style={{ backgroundColor: "#0d0d0d" }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#F5A623" }}>
                  School Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={form.school_email}
                  onChange={(e) => setForm({ ...form, school_email: e.target.value })}
                  required
                  placeholder="admin@school.cbe.ab.ca"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 border border-gray-700 outline-none focus:border-red-500 transition-colors"
                  style={{ backgroundColor: "#0d0d0d" }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#F5A623" }}>
                  School Level <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.school_level}
                  onChange={(e) => setForm({ ...form, school_level: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl text-white border border-gray-700 outline-none focus:border-red-500 transition-colors"
                  style={{ backgroundColor: "#0d0d0d" }}
                >
                  <option value="">Select level...</option>
                  {SCHOOL_LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#F5A623" }}>
                  Sport <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.sport}
                  onChange={(e) => setForm({ ...form, sport: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl text-white border border-gray-700 outline-none focus:border-red-500 transition-colors"
                  style={{ backgroundColor: "#0d0d0d" }}
                >
                  <option value="">Select sport...</option>
                  {SPORTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#F5A623" }}>
                  Team Name (optional)
                </label>
                <input
                  type="text"
                  value={form.team_name}
                  onChange={(e) => setForm({ ...form, team_name: e.target.value })}
                  placeholder="e.g. Junior Varsity Boys Basketball"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 border border-gray-700 outline-none focus:border-red-500 transition-colors"
                  style={{ backgroundColor: "#0d0d0d" }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#F5A623" }}>
                  # of Coaches Needed
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={form.num_coaches_needed}
                  onChange={(e) =>
                    setForm({ ...form, num_coaches_needed: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-4 py-3 rounded-xl text-white border border-gray-700 outline-none focus:border-red-500 transition-colors"
                  style={{ backgroundColor: "#0d0d0d" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5A623" }}>
                Schedule / Availability <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.schedule}
                onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                required
                placeholder="e.g. Tuesdays & Thursdays 4-6pm, starting January 2027"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 border border-gray-700 outline-none focus:border-red-500 transition-colors"
                style={{ backgroundColor: "#0d0d0d" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5A623" }}>
                Description / Requirements <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                rows={4}
                placeholder="Describe what you're looking for in a volunteer coach, any experience requirements, what the role involves, etc."
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 border border-gray-700 outline-none focus:border-red-500 transition-colors resize-none"
                style={{ backgroundColor: "#0d0d0d" }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#F5A623" }}>
                  Contact Person Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.contact_name}
                  onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                  required
                  placeholder="Coach / Athletic Director name"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 border border-gray-700 outline-none focus:border-red-500 transition-colors"
                  style={{ backgroundColor: "#0d0d0d" }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#F5A623" }}>
                  Contact Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                  required
                  placeholder="contact@school.ca"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 border border-gray-700 outline-none focus:border-red-500 transition-colors"
                  style={{ backgroundColor: "#0d0d0d" }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl font-black text-lg text-white transition-all duration-200 hover:scale-105 disabled:opacity-60"
              style={{ backgroundColor: "#CC0000" }}
            >
              {submitting ? "Posting... 🦕" : "🏀 Post Opportunity →"}
            </button>
          </form>
        )}

        {/* Posted Opportunities */}
        <div>
          <h2 className="text-2xl font-black text-white mb-6">
            All Posted Opportunities{" "}
            <span className="text-lg font-normal" style={{ color: "#F5A623" }}>
              ({myPostings.length})
            </span>
          </h2>

          {myPostings.length === 0 ? (
            <div
              className="rounded-2xl p-12 text-center border-2 border-dashed"
              style={{ borderColor: "#333" }}
            >
              <div className="text-5xl mb-4">📋</div>
              <p className="text-gray-400 text-lg">No opportunities posted yet.</p>
              <p className="text-gray-600 text-sm mt-2">
                Click &quot;Post New Opportunity&quot; to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(myPostings as Posting[]).map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl p-6 border transition-all duration-200 hover:scale-[1.02]"
                  style={{ backgroundColor: "#1a1a1a", borderColor: "#333" }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2"
                        style={{ backgroundColor: "#CC0000", color: "white" }}
                      >
                        {post.sport}
                      </span>
                      <h3 className="font-bold text-white text-lg">
                        {post.school_name}
                      </h3>
                      {post.team_name && (
                        <p className="text-sm" style={{ color: "#F5A623" }}>
                          {post.team_name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">{post.school_level}</span>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-3">
                    {post.description}
                  </p>

                  <div className="space-y-1 text-xs text-gray-500">
                    <p>🗓 {post.schedule}</p>
                    <p>
                      👥 {post.num_coaches_needed} coach
                      {post.num_coaches_needed !== 1 ? "es" : ""} needed
                    </p>
                    <p>📧 {post.contact_name} · {post.contact_email}</p>
                    <p className="text-gray-700 mt-2">
                      Posted {new Date(post.created_at).toLocaleDateString("en-CA")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
