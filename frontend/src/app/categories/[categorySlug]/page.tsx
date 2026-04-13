import Link from "next/link";
import { notFound } from "next/navigation";

import { getCategory } from "@/lib/api";
import type { Category } from "@/lib/types";

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  let category: Category;

  try {
    const response = await getCategory(categorySlug);
    category = response.data;
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-sky-50 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Category</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">{category.name}</h1>
        <p className="mt-2 max-w-3xl text-slate-600">{category.description || "No description provided."}</p>
        <p className="mt-4 inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-sm font-semibold text-sky-800">
          Click any subject card below to open the full lesson page.
        </p>
      </div>

      <div className="space-y-5">
        {category.subcategories.map((subcategory) => (
          <section key={subcategory.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-800">{subcategory.name}</h2>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                {subcategory.subjects.length} subject{subcategory.subjects.length === 1 ? "" : "s"}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{subcategory.description || "No description"}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Subjects</p>

            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {subcategory.subjects.map((subject) => (
                <li key={subject.id}>
                  <Link
                    href={`/subjects/${subject.slug}`}
                    className="group block rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-slate-800 group-hover:text-sky-800">{subject.title}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{subject.description || "Open this subject to read the lesson and multimedia content."}</p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 group-hover:border-sky-200 group-hover:text-sky-700">
                        Open
                      </span>
                    </div>
                    <p className="mt-3 text-xs font-semibold text-sky-700">Click to view lesson details -&gt;</p>
                  </Link>
                </li>
              ))}
            </ul>
            {subcategory.subjects.length === 0 && (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                No subjects added yet for this subcategory.
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
