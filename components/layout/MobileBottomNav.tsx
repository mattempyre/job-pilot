"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { JSX } from "react";
import {
  BriefcaseBusiness,
  LayoutDashboard,
  UserRound,
  type LucideIcon,
} from "lucide-react";

type MobileNavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

const mobileNavItems: MobileNavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/find-jobs", icon: BriefcaseBusiness, label: "Jobs" },
  { href: "/profile", icon: UserRound, label: "Profile" },
];

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav(): JSX.Element {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary mobile"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-surface/80 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-18px_55px_color-mix(in_srgb,var(--color-overlay)_16%,transparent)] backdrop-blur-2xl backdrop-saturate-150 md:hidden"
    >
      <div className="mx-auto grid max-w-[520px] grid-cols-3 gap-2">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-3 text-[12px] font-medium leading-4 transition-[background-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isActive
                  ? "bg-accent-muted text-accent shadow-sm"
                  : "text-text-secondary hover:bg-surface-secondary hover:text-accent"
              }`}
            >
              <Icon aria-hidden="true" className="size-5" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
