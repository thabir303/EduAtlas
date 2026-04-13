import Link from "next/link";

import { getCategories } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data: categories } = await getCategories();

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Explore Subjects</h1>
        <p className="mt-2 text-slate-600">
          Browse categories, open subjects, and click highlighted terms to view multimedia explanations.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {categories.map((category) => (
          <div key={category.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">{category.name}</h2>
              <Link
                href={`/categories/${category.slug}`}
                className="text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                View
              </Link>
            </div>
            <p className="mb-4 text-sm text-slate-600">{category.description || "No description"}</p>
            <div className="space-y-3">
              {category.subcategories.map((subcategory) => (
                <div key={subcategory.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <h3 className="text-sm font-semibold text-slate-700">{subcategory.name}</h3>
                  <ul className="mt-2 space-y-1">
                    {subcategory.subjects.map((subject) => (
                      <li key={subject.id}>
                        <Link
                          href={`/subjects/${subject.slug}`}
                          className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
                        >
                          {subject.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
