"use client";

import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import type { MediaAsset } from "@/lib/types";

import { AnnotationMark } from "./AnnotationExtension";
import EditorToolbar from "./EditorToolbar";

interface Props {
  initialContent: unknown;
  contentBlockId?: number;
  onSave: (tiptapJson: unknown) => void;
  saving: boolean;
}

export default function RichTextEditor({ initialContent, contentBlockId, onSave, saving }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Highlight, Underline, AnnotationMark],
    content: initialContent || { type: "doc", content: [{ type: "paragraph" }] },
    editorProps: {
      attributes: {
        class: "prose min-h-80 max-w-none p-6 focus:outline-none",
      },
    },
  });

  const handleLinkMedia = (asset: MediaAsset, annotationId: string) => {
    if (!editor) return;

    editor
      .chain()
      .focus()
      .setMark("annotation", {
        annotation_id: annotationId,
        media_type: asset.media_type,
      })
      .run();
  };

  return (
    <div>
      <EditorToolbar
        editor={editor}
        contentBlockId={contentBlockId}
        onLinkMedia={handleLinkMedia}
        onSave={() => onSave(editor?.getJSON())}
        saving={saving}
      />
      <EditorContent editor={editor} />
    </div>
  );
}
