import Link from "next/link";
import Logo from "./Logo";
import { ArrowLeft } from "./icons";

export default function AuthShell({
  back, backLabel, side, children,
}: { back: string; backLabel: string; side: { title: string; points: string[] }; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="relative hidden flex-col justify-between bg-ink p-12 text-paper lg:flex">
        <Link href="/"><Logo className="text-paper" /></Link>
        <div>
          <h2 className="max-w-sm text-4xl font-bold leading-tight">{side.title}</h2>
          <ul className="mt-8 space-y-3 text-white/70">
            {side.points.map((p) => (
              <li key={p} className="flex items-center gap-3"><span className="h-px w-6 bg-gold" />{p}</li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-white/40">UCalgary Dinos community initiative</p>
      </aside>
      <main className="flex flex-col px-6 py-8 sm:px-12">
        <Link href={back} className="link-draw inline-flex w-fit items-center gap-2 text-sm font-medium text-muted hover:text-ink">
          <ArrowLeft size={16} /> {backLabel}
        </Link>
        <div className="enter mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">{children}</div>
      </main>
    </div>
  );
}
