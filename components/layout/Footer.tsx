import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="flex flex-col gap-10 bg-surface px-8 py-16 md:flex-row md:items-center md:justify-between md:px-10">
      <Link href="/" aria-label="JobPilot home">
        <Image
          src="/logo.png"
          alt="JobPilot"
          width={177}
          height={60}
          className="h-12 w-auto"
        />
      </Link>
      <nav
        className="flex flex-col gap-5 text-[16px] font-normal leading-6 text-text-slate md:flex-row md:items-center md:gap-10"
        aria-label="Footer"
      >
        <Link href="/dashboard" className="transition-colors hover:text-accent">
          Dashboard
        </Link>
        <Link href="/privacy" className="transition-colors hover:text-accent">
          Privacy Policy
        </Link>
        <Link href="/terms" className="transition-colors hover:text-accent">
          Terms &amp; Condition
        </Link>
      </nav>
    </footer>
  );
}
