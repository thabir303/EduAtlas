"use client";

import { useEffect, useState } from "react";

import { getCategories, getMediaAssets, getSubjects } from "@/lib/api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    categories: 0,
    subjects: 0,
    mediaAssets: 0,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getCategories(), getSubjects(), getMediaAssets()])
      .then(([categories, subjects, media]) => {
        setStats({
          categories: categories.data.length,
          subjects: subjects.data.length,
          mediaAssets: media.data.length,
        });
        setError("");
      })
      .catch(() => {
        setError("Could not load dashboard stats.");
      });
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Dashboard</h1>
      {error && <p className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Categories</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{stats.categories}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Subjects</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{stats.subjects}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Media Assets</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{stats.mediaAssets}</p>
        </div>
      </div>
    </div>
  );
}
