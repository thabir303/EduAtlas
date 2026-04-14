"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import LoadingButton from "@/components/ui/LoadingButton";
import PaginationControls from "@/components/ui/PaginationControls";
import SkeletonBlock from "@/components/ui/SkeletonBlock";
import { createCategory, createSubcategory, getAllCategories, getCategories } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useAdminUiStore } from "@/store/admin-ui-store";

const PAGE_SIZE = 8;

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedCategoryId = useAdminUiStore((state) => state.selectedCategoryId);
  const setSelectedCategoryId = useAdminUiStore((state) => state.setSelectedCategoryId);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const canCreateCategory = categoryName.trim().length > 0;
  const canCreateSubcategory = subcategoryName.trim().length > 0 && !!selectedCategoryId;

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

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categoriesPage(currentPage),
    queryFn: async () => {
      const response = await getCategories({ page: currentPage });
      return response.data;
    },
  });

  const allCategoriesQuery = useQuery({
    queryKey: [...queryKeys.categories, "all"],
    queryFn: async () => {
      const response = await getAllCategories();
      return response.data;
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => createCategory({ name }),
    onSuccess: async () => {
      setCategoryName("");
      clearTimedError();
      showTimedSuccess("Category created successfully.");
      setCurrentPage(1);
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
    onError: () => {
      showTimedError("Failed to create category. Please check admin login and try again.");
    },
  });

  const createSubcategoryMutation = useMutation({
    mutationFn: (payload: { name: string; category: number }) => createSubcategory(payload),
    onSuccess: async () => {
      setSubcategoryName("");
      clearTimedError();
      showTimedSuccess("Subcategory created successfully.");
      setCurrentPage(1);
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
    onError: () => {
      showTimedError("Failed to create subcategory. Please select a valid category and try again.");
    },
  });

  const categories = useMemo(() => categoriesQuery.data?.results || [], [categoriesQuery.data]);
  const allCategories = useMemo(() => allCategoriesQuery.data || [], [allCategoriesQuery.data]);
  const loadingCategories = categoriesQuery.isPending;
  const categoriesLoadError =
    categoriesQuery.isError || allCategoriesQuery.isError ? "Could not load categories. Please try again." : "";
  const totalPages = Math.max(1, Math.ceil((categoriesQuery.data?.count || 0) / PAGE_SIZE));

  const handleCreateCategory = async () => {
    if (!canCreateCategory) return;

    setSuccess("");
    createCategoryMutation.mutate(categoryName.trim());
  };

  const handleCreateSubcategory = async () => {
    if (!canCreateSubcategory) return;

    setSuccess("");
    createSubcategoryMutation.mutate({
      name: subcategoryName.trim(),
      category: selectedCategoryId,
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-linear-to-r from-white to-slate-50 p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Manage Categories</h1>
        <p className="mt-1 text-sm text-slate-600">Create category hierarchy and quickly jump to latest linked subjects.</p>
      </div>
      {(error || categoriesLoadError) && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error || categoriesLoadError}
        </p>
      )}
      {success && <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">Create Category</h2>
          <div className="flex gap-2">
            <input
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              placeholder="Category name"
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <LoadingButton
              type="button"
              onClick={handleCreateCategory}
              disabled={!canCreateCategory}
              loading={createCategoryMutation.isPending}
              loadingText="Adding..."
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add
            </LoadingButton>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">Create Subcategory</h2>
          <div className="space-y-2">
            <select
              value={selectedCategoryId ?? ""}
              onChange={(event) => setSelectedCategoryId(event.target.value ? Number(event.target.value) : null)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select category</option>
              {allCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                value={subcategoryName}
                onChange={(event) => setSubcategoryName(event.target.value)}
                placeholder="Subcategory name"
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <LoadingButton
                type="button"
                onClick={handleCreateSubcategory}
                disabled={!canCreateSubcategory}
                loading={createSubcategoryMutation.isPending}
                loadingText="Adding..."
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Add
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Current Structure</h2>
          <p className="text-xs font-semibold text-slate-500">Page {currentPage} of {totalPages}</p>
        </div>
        {loadingCategories ? (
          <div className="space-y-3">
            <SkeletonBlock className="h-20 w-full" />
            <SkeletonBlock className="h-20 w-full" />
            <SkeletonBlock className="h-20 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => {
              const firstCategorySubject = category.subcategories.flatMap((subcategory) => subcategory.subjects)[0];

              return (
                <div key={category.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={firstCategorySubject ? `/subjects/${firstCategorySubject.slug}` : `/categories/${category.slug}`}
                      className="text-base font-semibold text-sky-700 underline-offset-2 hover:underline"
                    >
                      {category.name}
                    </Link>
                    {firstCategorySubject && (
                      <Link
                        href={`/subjects/${firstCategorySubject.slug}`}
                        className="text-xs font-semibold text-blue-700 underline-offset-2 hover:underline"
                      >
                        Open latest subject
                      </Link>
                    )}
                  </div>
                  <ul className="mt-2 space-y-1">
                    {category.subcategories.map((subcategory) => {
                      const firstSubject = subcategory.subjects[0];

                      return (
                        <li key={subcategory.id} className="text-sm text-slate-600">
                          {firstSubject ? (
                            <Link
                              href={`/subjects/${firstSubject.slug}`}
                              className="font-medium text-slate-800 underline-offset-2 hover:underline"
                            >
                              {subcategory.name}
                            </Link>
                          ) : (
                            <span className="font-medium text-slate-800">{subcategory.name}</span>
                          )}{" "}
                          ({subcategory.subjects.length} subjects)
                          {subcategory.subjects.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1">
                              {subcategory.subjects.map((subject) => (
                                <Link
                                  key={subject.id}
                                  href={`/subjects/${subject.slug}`}
                                  className="text-xs font-semibold text-blue-700 underline-offset-2 hover:underline"
                                >
                                  {subject.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              loading={loadingCategories}
            />

            {categories.length === 0 && (
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                No categories found on this page.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
