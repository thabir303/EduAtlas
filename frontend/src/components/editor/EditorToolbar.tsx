"use client";

import type { Editor } from "@tiptap/react";
import { Highlighter, Italic, Save, UnderlineIcon, Bold } from "lucide-react";
import { useState } from "react";

import LoadingButton from "@/components/ui/LoadingButton";
import { createInlineAnnotation } from "@/lib/api";
import type { MediaAsset } from "@/lib/types";

import MediaPicker from "./MediaPicker";

interface Props {
  editor: Editor | null;
  contentBlockId?: number;
  onLinkMedia: (asset: MediaAsset, annotationId: string) => void;
  onSave: () => void;
  saving: boolean;
}

export default function EditorToolbar({ editor, contentBlockId, onLinkMedia, onSave, saving }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  if (!editor) {
    return null;
  }

  const handleSelectAsset = async (asset: MediaAsset) => {
    const selectionText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      " ",
    );

    if (!selectionText.trim() || !contentBlockId) {
      return;
    }

    const { data } = await createInlineAnnotation({
      term: selectionText,
      media_asset_id: asset.id,
      content_block_id: contentBlockId,
    });

    onLinkMedia(asset, data.annotation_id);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 p-3">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className="rounded-md border border-slate-300 bg-white p-2"
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className="rounded-md border border-slate-300 bg-white p-2"
      >
        <Italic size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className="rounded-md border border-slate-300 bg-white p-2"
      >
        <UnderlineIcon size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className="rounded-md border border-slate-300 bg-white p-2"
      >
        <Highlighter size={16} />
      </button>

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white"
      >
        Link Media
      </button>

      <LoadingButton
        type="button"
        loading={saving}
        loadingText="Saving..."
        onClick={onSave}
        className="ml-auto inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        <Save size={14} />
        Save
      </LoadingButton>

      <MediaPicker isOpen={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handleSelectAsset} />
    </div>
  );
}
