"use client";

import { useMemo } from "react";

import type { BodyNode, InlineAnnotation, MarkType } from "@/lib/types";

interface Props {
  body: BodyNode[];
  annotations: InlineAnnotation[];
  onAnnotationClick: (annotationId: string) => void;
}

const annotationColors: Record<string, string> = {
  text: "text-red-600",
  image: "text-red-600",
  audio: "text-orange-500",
  video: "text-red-600",
  youtube: "text-red-600",
};

const annotationIcons: Record<string, string> = {
  text: "SEARCH",
  image: "IMG",
  audio: "AUDIO",
  video: "VID",
  youtube: "YT",
};

export default function AnnotatedText({ body, annotations, onAnnotationClick }: Props) {
  const annotationMap = useMemo(() => {
    const map = new Map<string, InlineAnnotation>();
    annotations.forEach((item) => map.set(item.annotation_id, item));
    return map;
  }, [annotations]);

  const getMarkClasses = (marks?: MarkType[]) => {
    if (!marks) {
      return "";
    }

    return marks
      .map((mark) => {
        if (mark === "bold") return "font-bold";
        if (mark === "italic") return "italic";
        if (mark === "underline") return "underline";
        if (mark === "highlight") return "bg-amber-200";
        return "";
      })
      .join(" ");
  };

  return (
    <div className="space-y-4 text-base leading-8 text-slate-700">
      {body.map((paragraph, pIdx) => (
        <p key={pIdx}>
          {paragraph.content.map((node, nIdx) => {
            if (node.type === "text") {
              return (
                <span key={nIdx} className={getMarkClasses(node.marks)}>
                  {node.text}
                </span>
              );
            }

            const annotation = annotationMap.get(node.annotation_id);
            const mediaType = annotation?.media_asset.media_type || "text";

            return (
              <button
                key={nIdx}
                type="button"
                onClick={() => onAnnotationClick(node.annotation_id)}
                className={`${annotationColors[mediaType] || "text-red-600"} inline-flex items-center gap-1 font-semibold underline transition hover:opacity-80`}
                title={`Open media: ${annotation?.term || node.text}`}
              >
                <span>{node.text}</span>
                <span className="rounded bg-slate-100 px-1 py-0.5 text-[10px] leading-none text-slate-600">
                  {annotationIcons[mediaType] || "INFO"}
                </span>
              </button>
            );
          })}
        </p>
      ))}
    </div>
  );
}
