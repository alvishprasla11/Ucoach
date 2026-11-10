import Image from "next/image";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-display text-xl font-bold ${className}`}>
      <Image src="/ucoach.svg" width={34} height={40} alt="" className="h-[40px] w-[34px] object-contain" />
      UCoach
    </span>
  );
}
