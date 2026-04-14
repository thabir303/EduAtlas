"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useEffect, useMemo, useRef, useState } from "react";

import Badge from "@/components/ui/Badge";
import LoadingButton from "@/components/ui/LoadingButton";
import PaginationControls from "@/components/ui/PaginationControls";
import SkeletonBlock from "@/components/ui/SkeletonBlock";
import {
  createMediaAsset,
  deleteMediaAsset,
  getMediaAssets,
} from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { MediaAsset, MediaType } from "@/lib/types";

const mediaTypes: MediaType[] = ["text", "image", "audio", "video", "youtube"];
const PAGE_SIZE = 8;
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
    return "Failed to save media asset. Please verify the input and try again.";
  }

  const firstEntry = Object.values(data)[0];
  if (Array.isArray(firstEntry) && firstEntry.length > 0) {
    return String(firstEntry[0]);
  }
  if (typeof firstEntry === "string") {
    return firstEntry;
  }

  return "Failed to save media asset. Please verify the input and try again.";
};

export default function AdminMediaPage() {
  const queryClient = useQueryClient();
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingAssetId, setDeletingAssetId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("text");
  const [textContent, setTextContent] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const canCreateAsset =
    title.trim().length > 0 &&
    ((mediaType === "text" && textContent.trim().length > 0) ||
      (mediaType === "youtube" && youtubeUrl.trim().length > 0) ||
      (["image", "audio", "video"].includes(mediaType) && !!file));

  const clearTimedError = () => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
    setError("");
  };

  const showTimedError = (message: string) => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    setError(message);
    errorTimeoutRef.current = setTimeout(() => {
      setError("");
      errorTimeoutRef.current = null;
    }, 3000);
  };

  const showTimedSuccess = (message: string) => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }

    setSuccess(message);
    successTimeoutRef.current = setTimeout(() => {
      setSuccess("");
      successTimeoutRef.current = null;
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const mediaAssetsQuery = useQuery({
    queryKey: queryKeys.mediaAssetsPage(currentPage),
    queryFn: async () => {
      const response = await getMediaAssets({ page: currentPage });
      return response.data;
    },
  });

  const createMediaAssetMutation = useMutation({
    mutationFn: (formData: FormData) => createMediaAsset(formData),
    onSuccess: async () => {
      resetForm();
      clearTimedError();
      showTimedSuccess("Media asset saved successfully.");
      setCurrentPage(1);
      await queryClient.invalidateQueries({ queryKey: queryKeys.mediaAssets });
    },
    onError: (error) => {
      showTimedError(getApiErrorMessage(error));
    },
  });

  const deleteMediaAssetMutation = useMutation({
    mutationFn: (id: number) => deleteMediaAsset(id),
    onSuccess: async () => {
      clearTimedError();
      showTimedSuccess("Media asset deleted.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.mediaAssets });
    },
    onError: () => {
      showTimedError("Failed to delete media asset.");
    },
    onSettled: () => {
      setDeletingAssetId(null);
    },
  });

  const assets = useMemo<MediaAsset[]>(() => mediaAssetsQuery.data?.results || [], [mediaAssetsQuery.data]);
  const loadingAssets = mediaAssetsQuery.isPending;
  const mediaLoadError = mediaAssetsQuery.isError ? "Could not load media assets." : "";
  const totalPages = Math.max(1, Math.ceil((mediaAssetsQuery.data?.count || 0) / PAGE_SIZE));

  const resetForm = () => {
    setTitle("");
    setMediaType("text");
    setTextContent("");
    setYoutubeUrl("");
    setFile(null);
  };

  const handleCreate = async () => {
    if (!canCreateAsset) {
      return;
    }

    const validationError = validateMediaAssetInput({
      mediaType,
      textContent,
      youtubeUrl,
      file,
    });

    if (validationError) {
      showTimedError(validationError);
      return;
    }

    setSuccess("");

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

    createMediaAssetMutation.mutate(formData);
  };

  const handleDelete = async (id: number) => {
    setDeletingAssetId(id);
    setSuccess("");
    deleteMediaAssetMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-linear-to-r from-white to-slate-50 p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Media Assets</h1>
        <p className="mt-1 text-sm text-slate-600">Upload reusable media and attach them to inline annotations.</p>
      </div>
      {(error || mediaLoadError) && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error || mediaLoadError}
        </p>
      )}
      {success && <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">Upload / Create Asset</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={mediaType}
            onChange={(event) => setMediaType(event.target.value as MediaType)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
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
              className="min-h-20 rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            />
          )}

          {mediaType === "youtube" && (
            <input
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              placeholder="YouTube URL"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-2"
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
                  showTimedError(
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
              className="rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            />
          )}

          <p className="text-xs text-slate-500 md:col-span-2">
            Limits: Text max 500 characters, image max 1 MB, audio max 2 MB, video max 2 MB.
          </p>
        </div>
        <LoadingButton
          type="button"
          onClick={handleCreate}
          disabled={!canCreateAsset}
          loading={createMediaAssetMutation.isPending}
          loadingText="Saving asset..."
          className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save Asset
        </LoadingButton>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Existing Assets</h2>
          <p className="text-xs font-semibold text-slate-500">Page {currentPage} of {totalPages}</p>
        </div>
        {loadingAssets ? (
          <div className="space-y-2">
            <SkeletonBlock className="h-16 w-full" />
            <SkeletonBlock className="h-16 w-full" />
            <SkeletonBlock className="h-16 w-full" />
          </div>
        ) : (
          <div className="space-y-2">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <p className="font-semibold text-slate-800">{asset.title}</p>
                    <Badge
                      label={asset.media_type}
                      tone={asset.media_type === "audio" ? "amber" : asset.media_type === "image" ? "green" : "slate"}
                    />
                  </div>
                  <p className="text-xs text-slate-500">ID: {asset.id}</p>
                </div>
                <LoadingButton
                  type="button"
                  onClick={() => handleDelete(asset.id)}
                  loading={deletingAssetId === asset.id}
                  loadingText="Deleting..."
                  className="rounded-md border border-rose-200 px-3 py-1.5 text-sm font-semibold text-rose-700"
                >
                  Delete
                </LoadingButton>
              </div>
            ))}

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              loading={loadingAssets}
            />

            {assets.length === 0 && (
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                No media assets found on this page.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
