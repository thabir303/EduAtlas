import Link from "next/link";

import { getCategories } from "@/lib/api";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams?: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const rawPage = Number(resolvedSearchParams.page || "1");
  const currentPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const { data: categoryPage } = await getCategories({ page: currentPage });
  const categories = categoryPage.results;
  const totalPages = Math.max(1, Math.ceil(categoryPage.count / 8));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const buildPageHref = (page: number) => (page <= 1 ? "/" : `/?page=${page}`);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8 rounded-2xl border border-slate-200 bg-linear-to-br from-white to-sky-50 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">EduAtlas Reader</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Explore Subjects</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Browse categories, open subjects, and click highlighted terms to view multimedia explanations.
        </p>
        <p className="mt-4 inline-flex rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-semibold text-sky-700">
          Total categories: {categoryPage.count}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {categories.map((category) => (
          <div key={category.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">{category.name}</h2>
              <Link
                href={`/categories/${category.slug}`}
                className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
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
                  {subcategory.subjects.length === 0 && (
                    <p className="mt-2 text-xs text-slate-500">No subjects available in this subcategory yet.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          No categories found on this page yet.
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
        <Link
          href={buildPageHref(safeCurrentPage - 1)}
          aria-disabled={safeCurrentPage <= 1}
          className={`rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 ${
            safeCurrentPage <= 1 ? "pointer-events-none opacity-40" : ""
          }`}
        >
          Previous
        </Link>
        <p className="text-sm font-semibold text-slate-600">
          Page {safeCurrentPage} of {totalPages}
        </p>
        <Link
          href={buildPageHref(safeCurrentPage + 1)}
          aria-disabled={safeCurrentPage >= totalPages}
          className={`rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 ${
            safeCurrentPage >= totalPages ? "pointer-events-none opacity-40" : ""
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
