"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";

import LoadingButton from "@/components/ui/LoadingButton";
import SkeletonBlock from "@/components/ui/SkeletonBlock";
import { createSubject, getCategories, getSubjects } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useAdminUiStore } from "@/store/admin-ui-store";

export default function AdminSubjectsPage() {
  const queryClient = useQueryClient();
  const selectedSubcategoryId = useAdminUiStore((state) => state.selectedSubcategoryId);
  const setSelectedSubcategoryId = useAdminUiStore((state) => state.setSelectedSubcategoryId);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [title, setTitle] = useState("");

  const subjectsQuery = useQuery({
    queryKey: queryKeys.subjects,
    queryFn: async () => {
      const response = await getSubjects();
      return response.data;
    },
  });

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      const response = await getCategories();
      return response.data;
    },
  });

  const createSubjectMutation = useMutation({
    mutationFn: (payload: { title: string; subcategory: number }) => createSubject(payload),
    onSuccess: async () => {
      setTitle("");
      setSelectedSubcategoryId(null);
      setError("");
      setSuccess("Subject created successfully.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.subjects });
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
    onError: () => {
      setError("Failed to create subject. Ensure valid subcategory and admin auth.");
    },
  });

  const subjects = useMemo(() => subjectsQuery.data || [], [subjectsQuery.data]);
  const categories = useMemo(() => categoriesQuery.data || [], [categoriesQuery.data]);
  const loadingData = subjectsQuery.isPending || categoriesQuery.isPending;
  const queryError =
    subjectsQuery.isError || categoriesQuery.isError ? "Could not load subjects/categories." : "";

  const subcategories = useMemo(
    () => categories.flatMap((category) => category.subcategories),
    [categories],
  );

  const handleCreateSubject = async () => {
    if (!title.trim() || !selectedSubcategoryId) {
      return;
    }

    setSuccess("");
    createSubjectMutation.mutate({ title: title.trim(), subcategory: selectedSubcategoryId });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Manage Subjects</h1>
      {(error || queryError) && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error || queryError}
        </p>
      )}
      {success && <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">Create Subject</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Subject title"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={selectedSubcategoryId ?? ""}
            onChange={(event) => setSelectedSubcategoryId(event.target.value ? Number(event.target.value) : null)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select subcategory</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
          <LoadingButton
            type="button"
            onClick={handleCreateSubject}
            loading={createSubjectMutation.isPending}
            loadingText="Adding subject..."
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
          >
            Add Subject
          </LoadingButton>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Subject List</h2>
        {loadingData ? (
          <div className="space-y-2">
            <SkeletonBlock className="h-16 w-full" />
            <SkeletonBlock className="h-16 w-full" />
            <SkeletonBlock className="h-16 w-full" />
          </div>
        ) : (
          <div className="space-y-2">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-800">{subject.title}</p>
                  <p className="text-xs text-slate-500">
                    {subject.category_name} / {subject.subcategory_name}
                  </p>
                </div>
                <Link
                  href={`/admin/subjects/${subject.slug}/edit`}
                  className="inline-flex items-center justify-center rounded-md border border-blue-200 px-3 py-1.5 text-sm font-semibold text-blue-700"
                >
                  Edit Content
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
