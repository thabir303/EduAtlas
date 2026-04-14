"use client";

import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";

import { createMediaAsset, getAllMediaAssets } from "@/lib/api";
import type { MediaAsset, MediaType } from "@/lib/types";

import Badge from "@/components/ui/Badge";
import LoadingButton from "@/components/ui/LoadingButton";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void | Promise<void>;
}

const mediaTypes: MediaType[] = ["text", "image", "audio", "video", "youtube"];
const MAX_TEXT_LENGTH = 500;
const MAX_IMAGE_SIZE_BYTES = 1 * 1024 * 1024;
const MAX_AUDIO_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = 2 * 1024 * 1024;

const validateMediaAssetInput = (params: {
  mediaType: MediaType;
  textContent: string;
  youtubeUrl: string;
  file: File | null;
}) => {
  const { mediaType, textContent, youtubeUrl, file } = params;

  if (mediaType === "text" && textContent.length > MAX_TEXT_LENGTH) {
    return `Text maximum length is ${MAX_TEXT_LENGTH} characters.`;
  }

  if (mediaType === "youtube" && !youtubeUrl.trim()) {
    return "YouTube URL is required.";
  }

  if (mediaType === "image") {
    if (!file) return "Image file is required.";
    if (file.size > MAX_IMAGE_SIZE_BYTES) return "Image maximum size is 1 MB.";
  }

  if (mediaType === "audio") {
    if (!file) return "Audio file is required.";
    if (file.size > MAX_AUDIO_SIZE_BYTES) return "Audio maximum size is 2 MB.";
  }

  if (mediaType === "video") {
    if (!file) return "Video file is required.";
    if (file.size > MAX_VIDEO_SIZE_BYTES) return "Video maximum size is 2 MB.";
  }

  return null;
};

const getApiErrorMessage = (error: unknown) => {
  const axiosError = error as AxiosError<Record<string, string | string[]>>;
  const data = axiosError?.response?.data;
  if (!data) {
    return "Failed to create media asset.";
  }

  const firstEntry = Object.values(data)[0];
  if (Array.isArray(firstEntry) && firstEntry.length > 0) {
    return String(firstEntry[0]);
  }
  if (typeof firstEntry === "string") {
    return firstEntry;
  }

  return "Failed to create media asset.";
};

export default function MediaPicker({ isOpen, onClose, onSelect }: Props) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectingAssetId, setSelectingAssetId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("text");
  const [textContent, setTextContent] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const canCreateAsset =
    title.trim().length > 0 &&
    ((mediaType === "text" && textContent.trim().length > 0) ||
      (mediaType === "youtube" && youtubeUrl.trim().length > 0) ||
      (["image", "audio", "video"].includes(mediaType) && !!file));

  const groupedAssets = useMemo(() => assets, [assets]);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    getAllMediaAssets()
      .then(({ data }) => setAssets(data))
      .finally(() => setLoading(false));
  }, [isOpen]);

  useEffect(() => {
    if (!error) return;
    const timeout = setTimeout(() => setError(""), 3000);
    return () => clearTimeout(timeout);
  }, [error]);

  const resetForm = () => {
    setTitle("");
    setMediaType("text");
    setTextContent("");
    setYoutubeUrl("");
    setFile(null);
  };

  const handleCreate = async () => {
    if (!canCreateAsset) return;

    const validationError = validateMediaAssetInput({
      mediaType,
      textContent,
      youtubeUrl,
      file,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

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
      setError("");
    } catch (error) {
      setError(getApiErrorMessage(error));
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
              <LoadingButton
                key={asset.id}
                type="button"
                loading={selectingAssetId === asset.id}
                loadingText="Linking..."
                onClick={async () => {
                  setSelectingAssetId(asset.id);
                  try {
                    await Promise.resolve(onSelect(asset));
                    onClose();
                  } finally {
                    setSelectingAssetId(null);
                  }
                }}
                className="w-full rounded-lg border border-slate-200 p-3 text-left transition hover:bg-slate-50"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">{asset.title}</p>
                  <Badge label={asset.media_type} tone={asset.media_type === "audio" ? "amber" : "slate"} />
                </div>
                <p className="text-xs text-slate-500">ID: {asset.id}</p>
              </LoadingButton>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase text-slate-500">Create New Asset</h4>
          <div className="space-y-3 rounded-lg border border-slate-200 p-3">
            {error && (
              <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
            )}
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
                maxLength={MAX_TEXT_LENGTH}
                placeholder="Text content (max 500 characters)"
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
                onChange={(event) => {
                  const nextFile = event.target.files?.[0] || null;
                  if (!nextFile) {
                    setFile(null);
                    return;
                  }

                  const tooLargeImage = mediaType === "image" && nextFile.size > MAX_IMAGE_SIZE_BYTES;
                  const tooLargeAudio = mediaType === "audio" && nextFile.size > MAX_AUDIO_SIZE_BYTES;
                  const tooLargeVideo = mediaType === "video" && nextFile.size > MAX_VIDEO_SIZE_BYTES;

                  if (tooLargeImage || tooLargeAudio || tooLargeVideo) {
                    setFile(null);
                    event.currentTarget.value = "";
                    setError(
                      mediaType === "image"
                        ? "Image maximum size is 1 MB."
                        : mediaType === "audio"
                          ? "Audio maximum size is 2 MB."
                          : "Video maximum size is 2 MB.",
                    );
                    return;
                  }

                  setFile(nextFile);
                }}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            )}

            <p className="text-xs text-slate-500">
              Limits: Text max 500 characters, image max 1 MB, audio max 2 MB, video max 2 MB.
            </p>

            <LoadingButton
              type="button"
              disabled={uploading || !canCreateAsset}
              loading={uploading}
              loadingText="Creating..."
              onClick={handleCreate}
              className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Create Asset
            </LoadingButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}
