import Link from "next/link";
import { notFound } from "next/navigation";

import ArticleReader from "@/components/reader/ArticleReader";
import MultimediaExamplesDemo from "@/components/reader/MultimediaExamplesDemo";
import { getSubject } from "@/lib/api";
import type { Subject } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;

  try {
    const { data } = await getSubject(slug);
    return {
      title: data.title,
      description: data.description,
    };
  } catch {
    return {
      title: "Subject",
    };
  }
}

export default async function SubjectDetailPage({ params }: Props) {
  const { slug } = await params;
  let subject: Subject;

  try {
    const response = await getSubject(slug);
    subject = response.data;
  } catch {
    notFound();
  }

  if (!subject.content_block) {
    return <div className="p-8 text-slate-500">No content available for this subject yet.</div>;
  }

  return (
    <div>
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
            <Link href="/" className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700 hover:bg-slate-100">
              Home
            </Link>
            <span className="text-slate-400">/</span>
            <Link
              href={`/categories/${subject.category_slug}`}
              className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 font-medium text-sky-800 hover:bg-sky-100"
            >
              {subject.category_name}
            </Link>
            <span className="text-slate-400">/</span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">{subject.subcategory_name}</span>
            <span className="text-slate-400">/</span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-semibold text-emerald-800">
              {subject.title}
            </span>
          </nav>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">{subject.title}</h1>
          <p className="mt-1 text-sm text-slate-600">
            Read the lesson, then click highlighted terms to open multimedia explanation popups.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 pt-8">
        <MultimediaExamplesDemo />
      </div>
      <ArticleReader subjectTitle={subject.title} contentBlock={subject.content_block} />
    </div>
  );
}
