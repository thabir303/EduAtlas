"use client";

import { useState } from "react";

import type { MediaAsset } from "@/lib/types";

import MultimediaModal from "./MultimediaModal";

const demoAssets: MediaAsset[] = [
  {
    id: -1,
    title: "Text Example",
    media_type: "text",
    text_content:
      "This is a sample text explanation. In the real lesson, highlighted terms can open contextual explanations like this.",
    created_at: "",
  },
  {
    id: -2,
    title: "Image Example",
    media_type: "image",
    file_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200",
    created_at: "",
  },
  {
    id: -3,
    title: "Audio Example",
    media_type: "audio",
    file_url: "https://www.w3schools.com/html/horse.mp3",
    created_at: "",
  },
  {
    id: -4,
    title: "Video Example",
    media_type: "video",
    file_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    created_at: "",
  },
  {
    id: -5,
    title: "YouTube Example",
    media_type: "youtube",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    created_at: "",
  },
];

const mediaLabels: Record<string, string> = {
  text: "Text",
  image: "Image",
  audio: "Audio",
  video: "Video",
  youtube: "YouTube",
};

export default function MultimediaExamplesDemo() {
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  return (
    <section className="mb-8 border-l-4 border-sky-500 pl-6">
      <h2 className="mb-3 text-xl font-bold text-slate-800">Multimedia Content Examples</h2>
      <div className="mb-4 border-b border-slate-200" />
      <div className="flex flex-wrap gap-3">
        {demoAssets.map((asset) => (
          <button
            key={asset.id}
            type="button"
            onClick={() => setSelectedAsset(asset)}
            className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {mediaLabels[asset.media_type] || asset.media_type}
          </button>
        ))}
      </div>

      <MultimediaModal asset={selectedAsset} isOpen={!!selectedAsset} onClose={() => setSelectedAsset(null)} />
    </section>
  );
}
