import { Whistle } from "./icons";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-display text-xl font-bold ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-red text-white">
        <Whistle size={18} />
      </span>
      DinoCoach
    </span>
  );
}
