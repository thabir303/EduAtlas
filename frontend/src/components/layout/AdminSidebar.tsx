"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/subjects", label: "Subjects" },
  { href: "/admin/media", label: "Media Assets" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 border-r border-slate-200 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 px-4 py-6 text-slate-200">
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">EduAtlas</p>
        <h2 className="mt-1 text-lg font-bold text-white">Content Studio</h2>
      </div>
      <div className="mt-6 space-y-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-cyan-50 text-cyan-800 ring-1 ring-cyan-200"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
