"use client";
/* eslint-disable @next/next/no-img-element */

import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import type { MediaAsset } from "@/lib/types";

interface Props {
  asset: MediaAsset | null;
  isOpen: boolean;
  onClose: () => void;
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

function badgeTone(mediaType: MediaAsset["media_type"]): "blue" | "green" | "amber" | "red" {
  if (mediaType === "text") return "blue";
  if (mediaType === "image") return "green";
  if (mediaType === "audio") return "amber";
  return "red";
}

export default function MultimediaModal({ asset, isOpen, onClose }: Props) {
  if (!asset) return null;

  const renderContent = () => {
    switch (asset.media_type) {
      case "text":
        return <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{asset.text_content}</p>;
      case "image":
        return (
          <img
            src={asset.file_url}
            alt={asset.title}
            className="max-h-[60vh] w-full rounded-xl border border-slate-200 object-contain"
          />
        );
      case "audio":
        return <audio controls src={asset.file_url} className="w-full" preload="metadata" />;
      case "video":
        return <video controls src={asset.file_url} className="w-full rounded-xl bg-black" preload="metadata" />;
      case "youtube": {
        const videoId = extractYouTubeId(asset.youtube_url || "");
        if (!videoId) {
          return <p className="text-sm text-rose-600">Invalid YouTube URL.</p>;
        }
        return (
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={asset.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full rounded-xl"
            />
          </div>
        );
      }
      default:
        return <p>Unsupported media type.</p>;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={asset.title}>
      <div className="mb-4">
        <Badge label={asset.media_type} tone={badgeTone(asset.media_type)} />
      </div>
      {renderContent()}
    </Modal>
  );
}
