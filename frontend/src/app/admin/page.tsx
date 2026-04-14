"use client";

import { useQuery } from "@tanstack/react-query";

import SkeletonBlock from "@/components/ui/SkeletonBlock";
import { getCategories, getMediaAssets, getSubjects } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export default function AdminDashboardPage() {
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      const response = await getCategories();
      return response.data;
    },
  });

  const subjectsQuery = useQuery({
    queryKey: queryKeys.subjects,
    queryFn: async () => {
      const response = await getSubjects();
      return response.data;
    },
  });

  const mediaAssetsQuery = useQuery({
    queryKey: queryKeys.mediaAssets,
    queryFn: async () => {
      const response = await getMediaAssets();
      return response.data;
    },
  });

  const loadingStats = categoriesQuery.isPending || subjectsQuery.isPending || mediaAssetsQuery.isPending;
  const error =
    categoriesQuery.isError || subjectsQuery.isError || mediaAssetsQuery.isError
      ? "Could not load dashboard stats."
      : "";

  const stats = {
    categories: categoriesQuery.data?.count || 0,
    subjects: subjectsQuery.data?.count || 0,
    mediaAssets: mediaAssetsQuery.data?.count || 0,
  };

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-slate-200 bg-linear-to-r from-white to-slate-50 p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Quick overview of your content inventory.</p>
      </div>
      {error && <p className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Categories</p>
          {loadingStats ? (
            <SkeletonBlock className="mt-2 h-8 w-14" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-slate-800">{stats.categories}</p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Subjects</p>
          {loadingStats ? (
            <SkeletonBlock className="mt-2 h-8 w-14" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-slate-800">{stats.subjects}</p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Media Assets</p>
          {loadingStats ? (
            <SkeletonBlock className="mt-2 h-8 w-14" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-slate-800">{stats.mediaAssets}</p>
          )}
        </div>
      </div>
    </div>
  );
}
