"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import LoadingButton from "@/components/ui/LoadingButton";
import PaginationControls from "@/components/ui/PaginationControls";
import SkeletonBlock from "@/components/ui/SkeletonBlock";
import { createSubject, getAllCategories, getSubjects } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useAdminUiStore } from "@/store/admin-ui-store";

const PAGE_SIZE = 8;

export default function AdminSubjectsPage() {
  const queryClient = useQueryClient();
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedSubcategoryId = useAdminUiStore((state) => state.selectedSubcategoryId);
  const setSelectedSubcategoryId = useAdminUiStore((state) => state.setSelectedSubcategoryId);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [title, setTitle] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const canCreateSubject = title.trim().length > 0 && !!selectedSubcategoryId;

  const clearTimedError = () => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
    setError("");
  };

  const showTimedError = (message: string) => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    setError(message);
    errorTimeoutRef.current = setTimeout(() => {
      setError("");
      errorTimeoutRef.current = null;
    }, 3000);
  };

  const showTimedSuccess = (message: string) => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }

    setSuccess(message);
    successTimeoutRef.current = setTimeout(() => {
      setSuccess("");
      successTimeoutRef.current = null;
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const subjectsQuery = useQuery({
    queryKey: queryKeys.subjectsPage(currentPage),
    queryFn: async () => {
      const response = await getSubjects({ page: currentPage });
      return response.data;
    },
  });

  const categoriesQuery = useQuery({
    queryKey: [...queryKeys.categories, "all"],
    queryFn: async () => {
      const response = await getAllCategories();
      return response.data;
    },
  });

  const createSubjectMutation = useMutation({
    mutationFn: (payload: { title: string; subcategory: number }) => createSubject(payload),
    onSuccess: async () => {
      setTitle("");
      setSelectedSubcategoryId(null);
      clearTimedError();
      showTimedSuccess("Subject created successfully.");
      setCurrentPage(1);
      await queryClient.invalidateQueries({ queryKey: queryKeys.subjects });
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
    onError: () => {
      showTimedError("Failed to create subject. Ensure valid subcategory and admin auth.");
    },
  });

  const subjects = useMemo(() => subjectsQuery.data?.results || [], [subjectsQuery.data]);
  const categories = useMemo(() => categoriesQuery.data || [], [categoriesQuery.data]);
  const loadingData = subjectsQuery.isPending || categoriesQuery.isPending;
  const queryError =
    subjectsQuery.isError || categoriesQuery.isError ? "Could not load subjects/categories." : "";
  const totalPages = Math.max(1, Math.ceil((subjectsQuery.data?.count || 0) / PAGE_SIZE));

  const subcategories = useMemo(
    () => categories.flatMap((category) => category.subcategories),
    [categories],
  );

  const handleCreateSubject = async () => {
    if (!canCreateSubject) {
      return;
    }

    setSuccess("");
    createSubjectMutation.mutate({ title: title.trim(), subcategory: selectedSubcategoryId });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-linear-to-r from-white to-slate-50 p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Manage Subjects</h1>
        <p className="mt-1 text-sm text-slate-600">Create subjects and open editor directly for content updates.</p>
      </div>
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
            disabled={!canCreateSubject}
            loading={createSubjectMutation.isPending}
            loadingText="Adding subject..."
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add Subject
          </LoadingButton>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Subject List</h2>
          <p className="text-xs font-semibold text-slate-500">Page {currentPage} of {totalPages}</p>
        </div>
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

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              loading={subjectsQuery.isPending}
            />

            {subjects.length === 0 && (
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                No subjects found on this page.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
