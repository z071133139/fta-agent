"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/analysis", label: "Analysis" },
  { href: "/design", label: "Design" },
  { href: "/target-coa", label: "Target COA" },
  { href: "/mapping", label: "Mapping" },
  { href: "/mje", label: "MJE Analysis" },
  { href: "/validation", label: "Validation" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { consultant, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-border bg-surface">
      {/* Wordmark */}
      <div className="px-6 py-5">
        <Link href="/" className="group flex items-baseline gap-1.5">
          <span className="font-serif text-xl text-foreground">FTA</span>
          <span className="text-sm text-muted group-hover:text-foreground transition-colors">
            Agent
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, label }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-surface-alt hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Consultant footer */}
      {consultant && (
        <div className="border-t border-border px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-xs font-medium text-accent">
                {consultant.display_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">
                  {consultant.display_name}
                </p>
                <p className="text-xs text-muted capitalize">{consultant.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-xs text-muted hover:text-foreground transition-colors"
              title="Sign out"
            >
              ↩
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
