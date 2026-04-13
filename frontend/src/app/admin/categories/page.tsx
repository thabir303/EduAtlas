"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";

import { createCategory, createSubcategory, getCategories } from "@/lib/api";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");
  const [error, setError] = useState("");

  const loadCategories = async () => {
    try {
      const { data } = await getCategories();
      setCategories(data);
      setError("");
    } catch {
      setError("Could not load categories. Please try again.");
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) return;
    try {
      await createCategory({ name: categoryName.trim() });
      setCategoryName("");
      await loadCategories();
    } catch {
      setError("Failed to create category. Please check admin login and try again.");
    }
  };

  const handleCreateSubcategory = async () => {
    if (!subcategoryName.trim() || !selectedCategory) return;
    try {
      await createSubcategory({ name: subcategoryName.trim(), category: Number(selectedCategory) });
      setSubcategoryName("");
      await loadCategories();
    } catch {
      setError("Failed to create subcategory. Please select a valid category and try again.");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Manage Categories</h1>
      {error && <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

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
            <button
              type="button"
              onClick={handleCreateCategory}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
            >
              Add
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">Create Subcategory</h2>
          <div className="space-y-2">
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value ? Number(event.target.value) : "")}
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
              <button
                type="button"
                onClick={handleCreateSubcategory}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Current Structure</h2>
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
      </div>
    </div>
  );
}
