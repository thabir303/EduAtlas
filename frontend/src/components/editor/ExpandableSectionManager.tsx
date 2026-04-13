"use client";

import { useMemo, useState } from "react";

import {
  createExpandableSection,
  deleteExpandableSection,
  updateExpandableSection,
} from "@/lib/api";
import type { ExpandableSection } from "@/lib/types";

interface Props {
  contentBlockId?: number;
  initialSections?: ExpandableSection[];
}

export default function ExpandableSectionManager({ contentBlockId, initialSections = [] }: Props) {
  const [sections, setSections] = useState<ExpandableSection[]>(initialSections);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");

  const sortedSections = useMemo(() => [...sections].sort((a, b) => a.order - b.order), [sections]);

  const handleCreate = async () => {
    if (!contentBlockId || !title.trim()) {
      setMessageTone("error");
      setMessage("Content block or section title is missing.");
      return;
    }

    try {
      const nextOrder = sortedSections.length;
      const { data } = await createExpandableSection({
        content_block: contentBlockId,
        title: title.trim(),
        body,
        order: nextOrder,
        is_default_open: false,
      });

      setSections((prev) => [...prev, data]);
      setTitle("");
      setBody("");
      setMessageTone("success");
      setMessage("Section added successfully.");
    } catch {
      setMessageTone("error");
      setMessage("Failed to add section. Please check admin login and try again.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteExpandableSection(id);
      setSections((prev) => prev.filter((section) => section.id !== id));
      setMessageTone("success");
      setMessage("Section deleted.");
    } catch {
      setMessageTone("error");
      setMessage("Failed to delete section.");
    }
  };

  const handleToggleDefaultOpen = async (section: ExpandableSection) => {
    try {
      const { data } = await updateExpandableSection(section.id, {
        is_default_open: !section.is_default_open,
      });

      setSections((prev) => prev.map((item) => (item.id === section.id ? data : item)));
      setMessageTone("success");
      setMessage("Section updated.");
    } catch {
      setMessageTone("error");
      setMessage("Failed to update section.");
    }
  };

  const moveSection = async (section: ExpandableSection, direction: -1 | 1) => {
    const index = sortedSections.findIndex((item) => item.id === section.id);
    const swapIndex = index + direction;

    if (index < 0 || swapIndex < 0 || swapIndex >= sortedSections.length) {
      return;
    }

    const target = sortedSections[swapIndex];

    try {
      const first = await updateExpandableSection(section.id, { order: target.order });
      const second = await updateExpandableSection(target.id, { order: section.order });

      setSections((prev) =>
        prev.map((item) => {
          if (item.id === section.id) return first.data;
          if (item.id === target.id) return second.data;
          return item;
        }),
      );
      setMessageTone("success");
      setMessage("Section order updated.");
    } catch {
      setMessageTone("error");
      setMessage("Failed to reorder sections.");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Expandable Sections</h3>
      {!!message && (
        <p
          className={`rounded-md border px-3 py-2 text-sm ${
            messageTone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {message}
        </p>
      )}

      <div className="rounded-lg border border-slate-200 p-4">
        <p className="mb-2 text-sm font-semibold text-slate-600">Add New Section</p>
        <div className="space-y-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Section title"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Section body"
            className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleCreate}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
          >
            Add Section
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {sortedSections.map((section, index) => (
          <div key={section.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">{section.title}</h4>
                <p className="text-xs text-slate-500">Order: {section.order}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveSection(section, -1)}
                  disabled={index === 0}
                  className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-40"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(section, 1)}
                  disabled={index === sortedSections.length - 1}
                  className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-40"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleDefaultOpen(section)}
                  className="rounded border border-blue-300 px-2 py-1 text-xs text-blue-700"
                >
                  {section.is_default_open ? "Default Open" : "Set Default"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(section.id)}
                  className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-600">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
