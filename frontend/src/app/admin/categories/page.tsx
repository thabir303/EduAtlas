"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import LoadingButton from "@/components/ui/LoadingButton";
import SkeletonBlock from "@/components/ui/SkeletonBlock";
import { createCategory, createSubcategory, getCategories } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useAdminUiStore } from "@/store/admin-ui-store";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const selectedCategoryId = useAdminUiStore((state) => state.selectedCategoryId);
  const setSelectedCategoryId = useAdminUiStore((state) => state.setSelectedCategoryId);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      const response = await getCategories();
      return response.data;
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => createCategory({ name }),
    onSuccess: async () => {
      setCategoryName("");
      setError("");
      setSuccess("Category created successfully.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
    onError: () => {
      setError("Failed to create category. Please check admin login and try again.");
    },
  });

  const createSubcategoryMutation = useMutation({
    mutationFn: (payload: { name: string; category: number }) => createSubcategory(payload),
    onSuccess: async () => {
      setSubcategoryName("");
      setError("");
      setSuccess("Subcategory created successfully.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
    onError: () => {
      setError("Failed to create subcategory. Please select a valid category and try again.");
    },
  });

  const categories = categoriesQuery.data || [];
  const loadingCategories = categoriesQuery.isPending;
  const categoriesLoadError = categoriesQuery.isError ? "Could not load categories. Please try again." : "";

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) return;

    setSuccess("");
    createCategoryMutation.mutate(categoryName.trim());
  };

  const handleCreateSubcategory = async () => {
    if (!subcategoryName.trim() || !selectedCategoryId) return;

    setSuccess("");
    createSubcategoryMutation.mutate({
      name: subcategoryName.trim(),
      category: selectedCategoryId,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Manage Categories</h1>
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
              loading={createCategoryMutation.isPending}
              loadingText="Adding..."
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
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
              {categories.map((category) => (
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
                loading={createSubcategoryMutation.isPending}
                loadingText="Adding..."
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
              >
                Add
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Current Structure</h2>
        {loadingCategories ? (
          <div className="space-y-3">
            <SkeletonBlock className="h-20 w-full" />
            <SkeletonBlock className="h-20 w-full" />
            <SkeletonBlock className="h-20 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <h3 className="font-semibold text-slate-800">{category.name}</h3>
                <ul className="mt-2 space-y-1">
                  {category.subcategories.map((subcategory) => (
                    <li key={subcategory.id} className="text-sm text-slate-600">
                      {subcategory.name} ({subcategory.subjects.length} subjects)
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
