"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import LoadingButton from "@/components/ui/LoadingButton";
import { login } from "@/lib/api";
import { setTokens } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { data } = await login(username, password);
      setTokens(data);
      setSuccess("Login successful. Redirecting...");
      router.replace("/admin");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSubmit();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-slate-100 via-white to-sky-100 p-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">EduAtlas Admin</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-600">Sign in to manage categories, subjects, and media assets.</p>

        {error && <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        {success && (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </p>
        )}

        <form className="mt-5 space-y-4" onSubmit={handleFormSubmit}>
          <div className="space-y-1.5">
            <label htmlFor="username" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              autoComplete="username"
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-12 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58a2 2 0 102.83 2.83" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 5.09A10.94 10.94 0 0112 4.91c5.05 0 9.27 3.12 10.67 7.5a11.8 11.8 0 01-4.12 5.74" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.61 6.61A11.8 11.8 0 001.33 12.4a11.87 11.87 0 003.79 5.2" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M1.33 12.4C2.73 8.02 6.95 4.9 12 4.9s9.27 3.12 10.67 7.5c-1.4 4.38-5.62 7.5-10.67 7.5S2.73 16.78 1.33 12.4z" />
                    <circle cx="12" cy="12.4" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <LoadingButton
            type="submit"
            loading={loading}
            loadingText="Logging in..."
            className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Sign In
          </LoadingButton>
        </form>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm">
          <Link href="/" className="text-slate-600 transition hover:text-slate-900 cursor-pointer">
            Back to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
