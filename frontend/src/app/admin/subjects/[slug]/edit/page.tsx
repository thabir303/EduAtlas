"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import ExpandableSectionManager from "@/components/editor/ExpandableSectionManager";
import SkeletonBlock from "@/components/ui/SkeletonBlock";
import { createContentBlock, getSubject, updateContentBlock } from "@/lib/api";
import { bodyNodesToTiptap, tiptapToBodyNodes } from "@/lib/tiptap-utils";
import type { Subject } from "@/lib/types";

const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor"), { ssr: false });

export default function SubjectEditPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [initializingBlock, setInitializingBlock] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) {
      return;
    }

    getSubject(slug)
      .then(async ({ data }) => {
        if (!data.content_block) {
          setInitializingBlock(true);

          try {
            const { data: contentBlock } = await createContentBlock({
              subject_id: data.id,
              title: data.title,
              body: [],
            });

            setSubject({
              ...data,
              content_block: contentBlock,
            });
            setError("");
          } catch {
            setError("Could not initialize content block for this subject.");
            setSubject(data);
          } finally {
            setInitializingBlock(false);
          }
        } else {
          setSubject(data);
          setError("");
        }
      })
      .catch(() => {
        setError("Could not load subject for editing.");
      });
  }, [slug]);

  const handleSave = async (tiptapJson: unknown) => {
    if (!subject?.content_block?.id) {
      setError("Content block is missing. Please reload this page.");
      return;
    }

    setSaving(true);
    try {
      const bodyNodes = tiptapToBodyNodes(tiptapJson);
      await updateContentBlock(subject.content_block.id, { body: bodyNodes });
      setError("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Save failed. Please ensure you are logged in as admin and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (error && !subject) {
    return <div className="p-6 text-rose-700">{error}</div>;
  }

  if (!subject) {
    return (
      <div className="space-y-4 p-6">
        <SkeletonBlock className="h-8 w-64" />
        <SkeletonBlock className="h-80 w-full" />
      </div>
    );
  }

  if (initializingBlock) {
    return (
      <div className="space-y-4 p-6">
        <SkeletonBlock className="h-8 w-72" />
        <SkeletonBlock className="h-80 w-full" />
      </div>
    );
  }

  if (!subject.content_block) {
    return <div className="p-6 text-rose-700">Content block was not created. Please reload and try again.</div>;
  }

  const initialContent = subject.content_block?.body
    ? bodyNodesToTiptap(subject.content_block.body)
    : { type: "doc", content: [{ type: "paragraph" }] };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Edit: {subject.title}</h1>
        {saved && <span className="text-sm font-semibold text-emerald-600">Saved</span>}
      </div>
      {error && <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {saved && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Content saved successfully.
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <RichTextEditor
          initialContent={initialContent}
          contentBlockId={subject.content_block?.id}
          onSave={handleSave}
          saving={saving}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <ExpandableSectionManager
          contentBlockId={subject.content_block?.id}
          initialSections={subject.content_block?.expandable_sections || []}
        />
      </div>
    </div>
  );
}
