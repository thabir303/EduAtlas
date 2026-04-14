"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import Badge from "@/components/ui/Badge";
import LoadingButton from "@/components/ui/LoadingButton";
import SkeletonBlock from "@/components/ui/SkeletonBlock";
import {
  createMediaAsset,
  deleteMediaAsset,
  getMediaAssets,
} from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { MediaAsset, MediaType } from "@/lib/types";

const mediaTypes: MediaType[] = ["text", "image", "audio", "video", "youtube"];

export default function AdminMediaPage() {
  const queryClient = useQueryClient();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingAssetId, setDeletingAssetId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("text");
  const [textContent, setTextContent] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const mediaAssetsQuery = useQuery({
    queryKey: queryKeys.mediaAssets,
    queryFn: async () => {
      const response = await getMediaAssets();
      return response.data;
    },
  });

  const createMediaAssetMutation = useMutation({
    mutationFn: (formData: FormData) => createMediaAsset(formData),
    onSuccess: async () => {
      resetForm();
      setError("");
      setSuccess("Media asset saved successfully.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.mediaAssets });
    },
    onError: () => {
      setError("Failed to save media asset. Please verify the input and try again.");
    },
  });

  const deleteMediaAssetMutation = useMutation({
    mutationFn: (id: number) => deleteMediaAsset(id),
    onSuccess: async () => {
      setError("");
      setSuccess("Media asset deleted.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.mediaAssets });
    },
    onError: () => {
      setError("Failed to delete media asset.");
    },
    onSettled: () => {
      setDeletingAssetId(null);
    },
  });

  const assets = useMemo<MediaAsset[]>(() => mediaAssetsQuery.data || [], [mediaAssetsQuery.data]);
  const loadingAssets = mediaAssetsQuery.isPending;
  const mediaLoadError = mediaAssetsQuery.isError ? "Could not load media assets." : "";

  const sortedAssets = useMemo(
    () => [...assets].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [assets],
  );

  const resetForm = () => {
    setTitle("");
    setMediaType("text");
    setTextContent("");
    setYoutubeUrl("");
    setFile(null);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
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
      <h1 className="text-2xl font-bold text-slate-900">Media Assets</h1>
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
              placeholder="Text content"
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
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            />
          )}
        </div>
        <LoadingButton
          type="button"
          onClick={handleCreate}
          loading={createMediaAssetMutation.isPending}
          loadingText="Saving asset..."
          className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
        >
          Save Asset
        </LoadingButton>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Existing Assets</h2>
        {loadingAssets ? (
          <div className="space-y-2">
            <SkeletonBlock className="h-16 w-full" />
            <SkeletonBlock className="h-16 w-full" />
            <SkeletonBlock className="h-16 w-full" />
          </div>
        ) : (
          <div className="space-y-2">
            {sortedAssets.map((asset) => (
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
          </div>
        )}
      </div>
    </div>
  );
}
