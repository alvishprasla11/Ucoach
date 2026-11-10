import Link from "next/link";
import AuthShell from "../../components/AuthShell";
import { GraduationCap, School, ArrowRight } from "../../components/icons";

const options = [
  { href: "/login/student", icon: GraduationCap, title: "I'm a UCalgary student", body: "Dinos athlete or student who wants to coach a youth team." },
  { href: "/login/school", icon: School, title: "I'm a Calgary school", body: "Elementary, junior high or high school that needs a coach." },
];

export default function LoginPage() {
  return (
    <AuthShell
      back="/"
      backLabel="Home"
      side={{ title: "Good coaches change how kids see the game.", points: ["Post or find a coaching need", "Match by sport, grade and schedule", "Free for schools and athletes"] }}
    >
      <h1 className="text-4xl font-bold">Log in</h1>
      <p className="mt-2 text-muted">Choose how you&rsquo;ll use UCoach.</p>
      <div className="mt-8 space-y-4">
        {options.map((o) => (
          <Link key={o.href} href={o.href} className="card-link group flex items-center gap-5 rounded-2xl border border-line bg-white p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-paper-2 text-red"><o.icon size={24} /></span>
            <span className="flex-1">
              <span className="block font-display text-lg font-bold">{o.title}</span>
              <span className="block text-sm text-muted">{o.body}</span>
            </span>
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </AuthShell>
  );
}
