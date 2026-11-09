"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  type: string;
  name: string;
  email: string;
}

interface Posting {
  id: number;
  school_name: string;
  school_email: string;
  school_level: string;
  sport: string;
  team_name: string | null;
  description: string;
  schedule: string;
  contact_name: string;
  contact_email: string;
  num_coaches_needed: number;
  created_at: string;
}

const SPORT_ICONS: Record<string, string> = {
  Basketball: "🏀",
  Football: "🏈",
  "Flag Football": "🏈",
  "Girls Basketball": "🏀",
  Other: "🏅",
};

const LEVEL_COLORS: Record<string, string> = {
  "Elementary (K-6)": "#2563eb",
  "Middle School (7-9)": "#7c3aed",
  "High School (10-12)": "#CC0000",
};

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [postings, setPostings] = useState<Posting[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSport, setFilterSport] = useState("All");
  const [filterLevel, setFilterLevel] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("dinocoach_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(stored) as User;
    if (parsed.type !== "student") {
      router.push("/login");
      return;
    }
    setUser(parsed);
    fetchPostings();
  }, [router]);

  const fetchPostings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/postings");
      const data = await res.json() as { postings: Posting[] };
      setPostings(data.postings || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("dinocoach_user");
    router.push("/");
  };

  const sports = ["All", ...Array.from(new Set(postings.map((p) => p.sport)))];
  const levels = ["All", "Elementary (K-6)", "Middle School (7-9)", "High School (10-12)"];

  const filtered = postings.filter((p) => {
    const matchSport = filterSport === "All" || p.sport === filterSport;
    const matchLevel = filterLevel === "All" || p.school_level === filterLevel;
    const matchSearch =
      !search ||
      p.school_name.toLowerCase().includes(search.toLowerCase()) ||
      p.sport.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchSport && matchLevel && matchSearch;
  });

  if (!user) return null;

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#0a0a0a" }}>
      {/* Navbar */}
      <nav
        className="w-full px-6 py-4 flex items-center justify-between shadow-lg"
        style={{ backgroundColor: "#CC0000" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl dino-roar">🦕</span>
          <div>
            <span className="text-white font-bold text-lg">
              Dino<span style={{ color: "#F5A623" }}>Coach</span>
            </span>
            <p className="text-red-200 text-xs">{user.name} · Student Dashboard</p>
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

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1">
            Coaching Opportunities{" "}
            <span className="text-lg font-normal" style={{ color: "#F5A623" }}>
              🦕 Go Dinos!
            </span>
          </h1>
          <p className="text-gray-400">
            Find a school team to coach and give back to the Calgary community
          </p>
        </div>

        {/* Filters */}
        <div
          className="rounded-2xl p-5 mb-8 border flex flex-col md:flex-row gap-4"
          style={{ backgroundColor: "#1a1a1a", borderColor: "#333" }}
        >
          <input
            type="text"
            placeholder="🔍 Search schools, sports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl text-white placeholder-gray-500 border border-gray-700 outline-none focus:border-red-500 transition-colors"
            style={{ backgroundColor: "#0d0d0d" }}
          />
          <select
            value={filterSport}
            onChange={(e) => setFilterSport(e.target.value)}
            className="px-4 py-3 rounded-xl text-white border border-gray-700 outline-none focus:border-red-500 transition-colors"
            style={{ backgroundColor: "#0d0d0d" }}
          >
            {sports.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All Sports" : s}
              </option>
            ))}
          </select>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-3 rounded-xl text-white border border-gray-700 outline-none focus:border-red-500 transition-colors"
            style={{ backgroundColor: "#0d0d0d" }}
          >
            {levels.map((l) => (
              <option key={l} value={l}>
                {l === "All" ? "All Levels" : l}
              </option>
            ))}
          </select>
          <button
            onClick={fetchPostings}
            className="px-5 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
            style={{ backgroundColor: "#CC0000" }}
          >
            ↻ Refresh
          </button>
        </div>

        {/* Count */}
        <p className="text-gray-500 text-sm mb-6">
          Showing {filtered.length} of {postings.length} opportunities
        </p>

        {/* Postings */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 dino-float">🦕</div>
            <p className="text-gray-400 text-xl">Loading opportunities...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="rounded-2xl p-14 text-center border-2 border-dashed"
            style={{ borderColor: "#333" }}
          >
            <div className="text-5xl mb-4">🦖</div>
            <p className="text-gray-400 text-lg">
              {postings.length === 0
                ? "No opportunities posted yet. Check back soon!"
                : "No results match your filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl p-6 border flex flex-col transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
                style={{ backgroundColor: "#1a1a1a", borderColor: "#2a2a2a" }}
              >
                {/* Top badges */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: "#CC0000", color: "white" }}
                  >
                    {SPORT_ICONS[post.sport] || "🏅"} {post.sport}
                  </span>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: LEVEL_COLORS[post.school_level] || "#555",
                      color: "white",
                    }}
                  >
                    {post.school_level.split(" ")[0]}
                  </span>
                </div>

                {/* School */}
                <h3 className="font-black text-white text-xl mb-1">{post.school_name}</h3>
                {post.team_name && (
                  <p className="text-sm mb-3" style={{ color: "#F5A623" }}>
                    {post.team_name}
                  </p>
                )}

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-1 line-clamp-4">
                  {post.description}
                </p>

                {/* Details */}
                <div
                  className="rounded-xl p-4 space-y-2 text-xs"
                  style={{ backgroundColor: "#0d0d0d" }}
                >
                  <div className="flex items-start gap-2">
                    <span>🗓</span>
                    <span className="text-gray-300">{post.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>👥</span>
                    <span className="text-gray-300">
                      {post.num_coaches_needed} volunteer coach
                      {post.num_coaches_needed !== 1 ? "es" : ""} needed
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>👤</span>
                    <span className="text-gray-300">{post.contact_name}</span>
                  </div>
                </div>

                {/* Contact button */}
                <a
                  href={`mailto:${post.contact_email}?subject=DinoCoach - Volunteer Interest: ${post.sport} at ${post.school_name}&body=Hello ${post.contact_name},%0A%0AI am a UCalgary Dinos varsity athlete interested in volunteering as a coach for the ${post.sport} program at ${post.school_name}.%0A%0APlease let me know how I can get involved!%0A%0AThank you!`}
                  className="mt-4 block text-center py-3 rounded-xl font-bold text-white transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: "#CC0000" }}
                >
                  📧 Contact School →
                </a>

                <p className="text-gray-700 text-xs text-center mt-2">
                  Posted {new Date(post.created_at).toLocaleDateString("en-CA")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
