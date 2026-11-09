import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#0a0a0a" }}>
      {/* Navbar */}
      <nav
        className="w-full px-6 py-4 flex items-center justify-between shadow-lg"
        style={{ backgroundColor: "#CC0000" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-4xl dino-roar">🦕</span>
          <div>
            <span className="text-white font-bold text-xl tracking-wide">
              Dino<span style={{ color: "#F5A623" }}>Coach</span>
            </span>
            <p className="text-red-200 text-xs">UCalgary Dinos Volunteer Program</p>
          </div>
        </div>
        <Link
          href="/login"
          className="px-6 py-2 rounded-full font-bold text-sm transition-all duration-200 hover:scale-105 hover:shadow-lg"
          style={{ backgroundColor: "#F5A623", color: "#0a0a0a" }}
        >
          LOGIN →
        </Link>
      </nav>

      {/* Hero Section */}
      <section
        className="flex flex-col items-center justify-center text-center px-6 py-24 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #CC0000 0%, #990000 50%, #0a0a0a 100%)",
        }}
      >
        {/* Background dinos */}
        <div className="absolute inset-0 opacity-5 text-9xl flex items-center justify-center select-none pointer-events-none">
          🦕🦖🦕🦖🦕
        </div>

        <div className="relative z-10 max-w-4xl">
          <div className="dino-float text-8xl mb-6">🦕</div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight">
            Go Dinos, Give Back!
          </h1>
          <p className="text-xl md:text-2xl mb-4" style={{ color: "#F5A623" }}>
            UCalgary Varsity Athletes × Calgary Youth Sports
          </p>
          <p className="text-gray-200 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            DinoCoach connects UCalgary Dinos varsity student-athletes with
            elementary, middle, and high school basketball & football teams
            across Calgary — as volunteer coaches, mentors, and role models.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 rounded-full font-bold text-lg transition-all duration-200 hover:scale-105 hover:shadow-2xl"
              style={{ backgroundColor: "#F5A623", color: "#0a0a0a" }}
            >
              🏀 Get Started
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 rounded-full font-bold text-lg border-2 text-white transition-all duration-200 hover:scale-105"
              style={{ borderColor: "#F5A623", color: "#F5A623" }}
            >
              Learn More ↓
            </a>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-10 px-6" style={{ backgroundColor: "#F5A623" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            { number: "50+", label: "Partner Schools", icon: "🏫" },
            { number: "200+", label: "Dino Coaches", icon: "🦕" },
            { number: "1,500+", label: "Youth Athletes", icon: "🏆" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl mb-1">{stat.icon}</div>
              <div className="text-4xl font-black" style={{ color: "#CC0000" }}>
                {stat.number}
              </div>
              <div className="text-gray-800 font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6" style={{ backgroundColor: "#111111" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-center text-white mb-4">
            How It <span style={{ color: "#CC0000" }}>Works</span>
          </h2>
          <p className="text-center text-gray-400 mb-14 text-lg">
            Simple. Impactful. Dino-approved. 🦖
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Schools */}
            <div
              className="rounded-2xl p-8 border-2"
              style={{ backgroundColor: "#1a1a1a", borderColor: "#CC0000" }}
            >
              <div className="text-5xl mb-4">🏫</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                For <span style={{ color: "#CC0000" }}>Schools</span>
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span style={{ color: "#F5A623" }}>✔</span>
                  <span>Post volunteer coaching opportunities for your teams</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#F5A623" }}>✔</span>
                  <span>Specify sport, school level, schedule, and requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#F5A623" }}>✔</span>
                  <span>Connect with motivated varsity athletes eager to give back</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#F5A623" }}>✔</span>
                  <span>Build lasting partnerships with UCalgary Dinos</span>
                </li>
              </ul>
              <Link
                href="/login"
                className="inline-block mt-6 px-6 py-3 rounded-full font-bold text-white transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: "#CC0000" }}
              >
                Post an Opportunity →
              </Link>
            </div>

            {/* Students */}
            <div
              className="rounded-2xl p-8 border-2"
              style={{ backgroundColor: "#1a1a1a", borderColor: "#F5A623" }}
            >
              <div className="text-5xl mb-4">🦕</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                For <span style={{ color: "#F5A623" }}>Dino Athletes</span>
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span style={{ color: "#CC0000" }}>✔</span>
                  <span>Browse available coaching opportunities across Calgary</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#CC0000" }}>✔</span>
                  <span>Give back to the community while developing leadership skills</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#CC0000" }}>✔</span>
                  <span>Mentor the next generation of Calgary athletes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#CC0000" }}>✔</span>
                  <span>Add meaningful volunteer coaching to your resume</span>
                </li>
              </ul>
              <Link
                href="/login"
                className="inline-block mt-6 px-6 py-3 rounded-full font-bold text-white transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: "#F5A623", color: "#0a0a0a" }}
              >
                Find Opportunities →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Section */}
      <section className="py-20 px-6" style={{ backgroundColor: "#0d0d0d" }}>
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4">
            Sports We <span style={{ color: "#F5A623" }}>Cover</span>
          </h2>
          <p className="text-gray-400 mb-12 text-lg">
            Helping youth athletes roar like Dinos 🦖
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "🏀", sport: "Basketball", levels: "Elem / Middle / High" },
              { icon: "🏈", sport: "Football", levels: "Elem / Middle / High" },
              { icon: "🏀", sport: "Girls Basketball", levels: "All Levels" },
              { icon: "🏈", sport: "Flag Football", levels: "Elementary" },
            ].map((s) => (
              <div
                key={s.sport}
                className="rounded-2xl p-6 border transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: "#1a1a1a", borderColor: "#333" }}
              >
                <div className="text-5xl mb-3">{s.icon}</div>
                <h3 className="font-bold text-white mb-1">{s.sport}</h3>
                <p className="text-xs text-gray-400">{s.levels}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20 px-6 text-center"
        style={{ background: "linear-gradient(135deg, #CC0000, #990000)" }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-6xl mb-6 dino-float">🦖</div>
          <h2 className="text-4xl font-black text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-red-200 text-lg mb-8">
            Whether you're a school looking for coaches or a Dino athlete ready to give back —
            your journey starts here.
          </p>
          <Link
            href="/login"
            className="inline-block px-10 py-4 rounded-full font-black text-xl transition-all duration-200 hover:scale-105 hover:shadow-2xl"
            style={{ backgroundColor: "#F5A623", color: "#0a0a0a" }}
          >
            🦕 Join DinoCoach →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center" style={{ backgroundColor: "#000" }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">🦕</span>
          <span className="text-white font-bold">
            Dino<span style={{ color: "#F5A623" }}>Coach</span>
          </span>
        </div>
        <p className="text-gray-500 text-sm">
          A UCalgary Dinos Community Initiative · Calgary, AB
        </p>
        <p className="text-gray-600 text-xs mt-2">
          Go Dinos! 🏆
        </p>
      </footer>
    </main>
  );
}
