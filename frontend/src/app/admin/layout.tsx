"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import AdminSidebar from "@/components/layout/AdminSidebar";
import { isAuthenticated } from "@/lib/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated() && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#eef2ff_45%,#f8fafc_100%)]">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-white/70 bg-white/75 p-5 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm md:p-7">
          {children}
        </div>
      </main>
    </div>
  );
}
