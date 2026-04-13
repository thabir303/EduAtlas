"use client";

import { useCallback, useState } from "react";

import { getAnnotationByUUID } from "@/lib/api";
import type { ContentBlock, MediaAsset } from "@/lib/types";

import AnnotatedText from "./AnnotatedText";
import ExpandableSidebar from "./ExpandableSidebar";
import MultimediaModal from "./MultimediaModal";

interface Props {
  subjectTitle: string;
  contentBlock: ContentBlock;
}

export default function ArticleReader({ subjectTitle, contentBlock }: Props) {
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAnnotationClick = useCallback(
    async (annotationId: string) => {
      const localAnnotation = contentBlock.annotations.find((item) => item.annotation_id === annotationId);

      if (localAnnotation) {
        setSelectedAsset(localAnnotation.media_asset);
        setModalOpen(true);
        return;
      }

      try {
        const { data } = await getAnnotationByUUID(annotationId);
        setSelectedAsset(data.media_asset);
        setModalOpen(true);
      } catch {
        setSelectedAsset(null);
      }
    },
    [contentBlock.annotations],
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8 lg:flex-row">
      <main className="flex-1 border-l-4 border-sky-500 pl-6">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">{subjectTitle}</h1>
        <div className="mb-6 border-b border-slate-200" />
        <AnnotatedText
          body={contentBlock.body}
          annotations={contentBlock.annotations}
          onAnnotationClick={handleAnnotationClick}
        />
      </main>

      <ExpandableSidebar sections={contentBlock.expandable_sections} />

      <MultimediaModal asset={selectedAsset} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
