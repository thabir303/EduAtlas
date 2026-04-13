"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";

import { authChangedEvent, clearTokens, isAuthenticated } from "@/lib/auth";

const subscribeAuth = (onStoreChange: () => void) => {
  const handler = () => onStoreChange();
  window.addEventListener(authChangedEvent, handler);
  window.addEventListener("focus", handler);

  return () => {
    window.removeEventListener(authChangedEvent, handler);
    window.removeEventListener("focus", handler);
  };
};

export default function Navbar() {
  const router = useRouter();
  const authenticated = useSyncExternalStore(subscribeAuth, isAuthenticated, () => false);

  const handleLogout = () => {
    clearTokens();
    router.replace("/admin/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="group inline-flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-500 shadow-[0_0_0_6px_rgba(6,182,212,0.18)]" />
          <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-cyan-700">EduAtlas</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm font-semibold text-slate-700">
          <Link href="/" className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900">
            Home
          </Link>

          {authenticated ? (
            <>
              <Link
                href="/admin"
                className="rounded-full px-4 py-2 text-cyan-700 transition hover:bg-cyan-50 hover:text-cyan-800"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-800 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/admin/login"
              className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-cyan-800 transition hover:border-cyan-300 hover:bg-cyan-100"
            >
            Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
