"use client";

import { useEffect, useMemo, useState } from "react";

import { createMediaAsset, getMediaAssets } from "@/lib/api";
import type { MediaAsset, MediaType } from "@/lib/types";

import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
}

const mediaTypes: MediaType[] = ["text", "image", "audio", "video", "youtube"];

export default function MediaPicker({ isOpen, onClose, onSelect }: Props) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("text");
  const [textContent, setTextContent] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const groupedAssets = useMemo(() => assets, [assets]);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    getMediaAssets()
      .then(({ data }) => setAssets(data))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const resetForm = () => {
    setTitle("");
    setMediaType("text");
    setTextContent("");
    setYoutubeUrl("");
    setFile(null);
  };

  const handleCreate = async () => {
    if (!title.trim()) return;

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("media_type", mediaType);

    if (mediaType === "text") {
      formData.append("text_content", textContent);
    }
    if (mediaType === "youtube") {
      formData.append("youtube_url", youtubeUrl);
    }
    if (["image", "audio", "video"].includes(mediaType) && file) {
      formData.append("file", file);
    }

    setUploading(true);
    try {
      const { data } = await createMediaAsset(formData);
      setAssets((prev) => [data, ...prev]);
      resetForm();
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select or Create Media">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase text-slate-500">Existing Assets</h4>
          <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
            {loading && <LoadingSpinner />}
            {!loading && groupedAssets.length === 0 && <p className="text-sm text-slate-500">No media assets found.</p>}
            {groupedAssets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => {
                  onSelect(asset);
                  onClose();
                }}
                className="w-full rounded-lg border border-slate-200 p-3 text-left transition hover:bg-slate-50"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">{asset.title}</p>
                  <Badge label={asset.media_type} tone={asset.media_type === "audio" ? "amber" : "slate"} />
                </div>
                <p className="text-xs text-slate-500">ID: {asset.id}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase text-slate-500">Create New Asset</h4>
          <div className="space-y-3 rounded-lg border border-slate-200 p-3">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Asset title"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              value={mediaType}
              onChange={(event) => setMediaType(event.target.value as MediaType)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {mediaTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {mediaType === "text" && (
              <textarea
                value={textContent}
                onChange={(event) => setTextContent(event.target.value)}
                placeholder="Text content"
                className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            )}

            {mediaType === "youtube" && (
              <input
                value={youtubeUrl}
                onChange={(event) => setYoutubeUrl(event.target.value)}
                placeholder="YouTube URL"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            )}

            {["image", "audio", "video"].includes(mediaType) && (
              <input
                type="file"
                accept={mediaType === "image" ? "image/*" : mediaType === "audio" ? "audio/*" : "video/*"}
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            )}

            <button
              type="button"
              disabled={uploading}
              onClick={handleCreate}
              className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
            >
              {uploading ? "Creating..." : "Create Asset"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
