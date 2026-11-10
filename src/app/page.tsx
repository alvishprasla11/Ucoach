import Link from "next/link";
import Logo from "../components/Logo";
import {
  ArrowRight, Check, MapPin, Clock, GraduationCap, School,
  ClipboardList, Search, Handshake,
} from "../components/icons";

const steps = [
  { icon: ClipboardList, title: "Schools post a need", body: "Pick the sport, grade level, practice nights and what the team needs." },
  { icon: Search, title: "Athletes browse and apply", body: "Dinos athletes filter by sport, area and schedule, then apply in a few clicks." },
  { icon: Handshake, title: "Coach and team meet", body: "The school confirms, the athlete shows up. A varsity coach on the sideline." },
];

const sports = [
  ["Basketball", "Elementary, junior high, high school"],
  ["Football", "Junior high and high school"],
  ["Flag football", "Elementary"],
  ["Girls basketball", "All grade levels"],
];

export default function Home() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/"><Logo /></Link>
          <div className="flex items-center gap-7 text-sm font-medium">
            <a href="#how" className="link-draw hidden sm:inline">How it works</a>
            <a href="#sports" className="link-draw hidden sm:inline">Sports</a>
            <Link href="/login" className="btn btn-primary !py-2">Log in</Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 lg:grid-cols-[1.1fr_1fr] lg:py-28">
          <div>
            <p className="enter mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-sm text-muted">
              <span className="h-2 w-2 rounded-full bg-red" /> UCalgary Dinos × Calgary schools
            </p>
            <h1 className="enter enter-2 text-5xl font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl">
              Varsity athletes, coaching Calgary&rsquo;s youth teams.
            </h1>
            <p className="enter enter-3 mt-6 max-w-xl text-lg leading-relaxed text-muted">
              DinoCoach matches UCalgary Dinos student-athletes with elementary, junior high and
              high school basketball and football teams that need a volunteer coach.
            </p>
            <div className="enter enter-4 mt-9 flex flex-wrap gap-3">
              <Link href="/login/student" className="btn btn-primary">
                Coach a team <ArrowRight size={18} />
              </Link>
              <Link href="/login/school" className="btn btn-ghost">
                Post a coaching need
              </Link>
            </div>
          </div>

          {/* Live product UI: a posting */}
          <div className="enter enter-3 relative">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-paper-2" />
            <div className="rounded-2xl border border-line bg-white p-6 shadow-[0_30px_60px_-30px_rgb(22_18_15/0.25)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">New posting</p>
                  <h3 className="mt-1 text-xl font-bold">Grade 8 boys basketball</h3>
                  <p className="text-sm text-muted">Sample school, NE Calgary</p>
                </div>
                <span className="rounded-full bg-gold/30 px-3 py-1 text-xs font-semibold">Open</span>
              </div>
              <ul className="mt-5 space-y-2.5 text-sm">
                <li className="flex items-center gap-2.5"><Clock size={16} className="text-red" /> Tue and Thu, 3:30 to 5:00 pm</li>
                <li className="flex items-center gap-2.5"><MapPin size={16} className="text-red" /> On site, school gym</li>
                <li className="flex items-center gap-2.5"><Check size={16} className="text-red" /> Needs one assistant coach</li>
              </ul>
              <Link href="/login/student" className="btn btn-primary mt-6 w-full">
                Apply to coach
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="border-y border-line bg-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="max-w-xl text-4xl font-bold sm:text-5xl">Three steps from posting to practice.</h2>
            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
              {steps.map((s, i) => (
                <div key={s.title} className="bg-paper p-8">
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-white"><s.icon size={22} /></span>
                    <span className="font-display text-sm text-muted">0{i + 1}</span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Two audiences */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="max-w-xl text-4xl font-bold sm:text-5xl">Pick your side of the bench.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Link href="/login/school" className="card-link group block rounded-2xl border border-line bg-white p-8">
              <School size={28} className="text-red" />
              <h3 className="mt-5 text-2xl font-bold">For schools</h3>
              <p className="mt-2 text-muted">Find a coach for a team that has none.</p>
              <ul className="mt-5 space-y-2 text-sm">
                {["Post sport, grade and schedule", "Review applicants from the Dinos roster", "Work with a coach who has played at a high level"].map((t) => (
                  <li key={t} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-red" />{t}</li>
                ))}
              </ul>
              <span className="mt-7 inline-flex items-center gap-2 font-semibold">Post a coaching need <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span>
            </Link>
            <Link href="/login/student" className="card-link group block rounded-2xl border border-line bg-white p-8">
              <GraduationCap size={28} className="text-red" />
              <h3 className="mt-5 text-2xl font-bold">For Dinos athletes</h3>
              <p className="mt-2 text-muted">Put your experience to use off campus.</p>
              <ul className="mt-5 space-y-2 text-sm">
                {["Browse open teams across Calgary", "Build leadership and volunteer hours", "Choose sport and nights that fit your season"].map((t) => (
                  <li key={t} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-red" />{t}</li>
                ))}
              </ul>
              <span className="mt-7 inline-flex items-center gap-2 font-semibold">Find a team <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span>
            </Link>
          </div>
        </section>

        {/* Sports */}
        <section id="sports" className="bg-ink text-paper">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="max-w-xl text-4xl font-bold sm:text-5xl">Basketball and football, every grade.</h2>
            <dl className="mt-12 grid border-t border-white/15 sm:grid-cols-2">
              {sports.map(([name, levels]) => (
                <div key={name} className="flex items-baseline justify-between gap-4 border-b border-white/15 py-5 sm:odd:pr-8 sm:even:pl-8 sm:even:border-l sm:even:border-white/15">
                  <dt className="font-display text-2xl font-semibold">{name}</dt>
                  <dd className="text-right text-sm text-white/60">{levels}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Close */}
        <section className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h2 className="mx-auto max-w-2xl text-4xl font-bold sm:text-6xl">A team is waiting for a coach.</h2>
          <div className="mt-9 flex justify-center">
            <Link href="/login" className="btn btn-primary">Create your account <ArrowRight size={18} /></Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted sm:flex-row">
          <Logo className="!text-base text-ink" />
          <p>A UCalgary Dinos community initiative. Calgary, AB.</p>
        </div>
      </footer>
    </div>
  );
}
