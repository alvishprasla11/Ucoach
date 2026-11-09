"use client";

import Link from "next/link";

export default function LoginPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
      style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a0000 50%, #0a0a0a 100%)" }}
    >
      {/* Back to home */}
      <Link
        href="/"
        className="absolute top-6 left-6 text-sm flex items-center gap-2 transition-colors"
        style={{ color: "#F5A623" }}
      >
        ← Back to Home
      </Link>

      <div className="text-center mb-10">
        <div className="text-6xl mb-4 dino-roar">🦕</div>
        <h1 className="text-4xl font-black text-white mb-2">
          Welcome to <span style={{ color: "#CC0000" }}>Dino</span>
          <span style={{ color: "#F5A623" }}>Coach</span>
        </h1>
        <p className="text-gray-400 text-lg">Select your login type to continue</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* UCalgary Student */}
        <Link
          href="/login/student"
          className="group rounded-2xl p-8 border-2 flex flex-col items-center text-center transition-all duration-200 hover:scale-105 hover:shadow-2xl cursor-pointer"
          style={{ backgroundColor: "#1a1a1a", borderColor: "#CC0000" }}
        >
          <div className="text-6xl mb-4 group-hover:animate-bounce">🦕</div>
          <h2 className="text-2xl font-black text-white mb-2">UCalgary Student</h2>
          <p className="text-gray-400 text-sm mb-6">
            Dinos varsity athlete or student looking to volunteer as a youth coach
          </p>
          <span
            className="px-6 py-3 rounded-full font-bold text-white transition-all duration-200"
            style={{ backgroundColor: "#CC0000" }}
          >
            Student Login →
          </span>
        </Link>

        {/* Calgary School */}
        <Link
          href="/login/school"
          className="group rounded-2xl p-8 border-2 flex flex-col items-center text-center transition-all duration-200 hover:scale-105 hover:shadow-2xl cursor-pointer"
          style={{ backgroundColor: "#1a1a1a", borderColor: "#F5A623" }}
        >
          <div className="text-6xl mb-4 group-hover:animate-bounce">🏫</div>
          <h2 className="text-2xl font-black text-white mb-2">Calgary School</h2>
          <p className="text-gray-400 text-sm mb-6">
            Elementary, middle, or high school looking to post coaching volunteer opportunities
          </p>
          <span
            className="px-6 py-3 rounded-full font-bold text-black transition-all duration-200"
            style={{ backgroundColor: "#F5A623" }}
          >
            School Login →
          </span>
        </Link>
      </div>

      <p className="text-gray-600 text-xs mt-10 text-center">
        🦖 DinoCoach · UCalgary Dinos Community Initiative
      </p>
    </main>
  );
}
