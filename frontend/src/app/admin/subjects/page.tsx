"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { createSubject, getCategories, getSubjects } from "@/lib/api";
import type { Category, SubjectListItem } from "@/lib/types";

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | "">("");

  const subcategories = useMemo(
    () => categories.flatMap((category) => category.subcategories),
    [categories],
  );

  const loadData = async () => {
    try {
      const [subjectRes, categoryRes] = await Promise.all([getSubjects(), getCategories()]);
      setSubjects(subjectRes.data);
      setCategories(categoryRes.data);
      setError("");
    } catch {
      setError("Could not load subjects/categories.");
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleCreateSubject = async () => {
    if (!title.trim() || !selectedSubcategory) {
      return;
    }

    try {
      await createSubject({ title: title.trim(), subcategory: Number(selectedSubcategory) });
      setTitle("");
      setSelectedSubcategory("");
      await loadData();
    } catch {
      setError("Failed to create subject. Ensure valid subcategory and admin auth.");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Manage Subjects</h1>
      {error && <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

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
            value={selectedSubcategory}
            onChange={(event) => setSelectedSubcategory(event.target.value ? Number(event.target.value) : "")}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select subcategory</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleCreateSubject}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
          >
            Add Subject
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Subject List</h2>
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
      </div>
    </div>
  );
}
