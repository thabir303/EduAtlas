"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";

import type { ExpandableSection } from "@/lib/types";

interface Props {
  sections: ExpandableSection[];
}

export default function ExpandableSidebar({ sections }: Props) {
  const defaultOpenIds = useMemo(
    () => new Set(sections.filter((section) => section.is_default_open).map((section) => section.id)),
    [sections],
  );

  const [openIds, setOpenIds] = useState<Set<number>>(defaultOpenIds);

  const toggleSection = (id: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <aside className="w-full max-w-xs shrink-0">
      <h2 className="mb-4 border-b-2 border-sky-500 pb-2 text-xl font-bold text-slate-800">Expandable Content</h2>
      <div className="space-y-2">
        {sections.map((section) => {
          const isOpen = openIds.has(section.id);
          return (
            <div key={section.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between bg-slate-800 px-4 py-3 text-left text-sm font-semibold text-white"
              >
                <span>{section.title}</span>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {isOpen && <div className="px-4 py-3 text-sm leading-relaxed text-slate-700">{section.body}</div>}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
