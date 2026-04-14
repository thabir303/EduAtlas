export const queryKeys = {
  categories: ["categories"] as const,
  category: (slug: string) => ["categories", slug] as const,
  subjects: ["subjects"] as const,
  subject: (slug: string) => ["subjects", slug] as const,
  mediaAssets: ["media-assets"] as const,
  annotation: (annotationId: string) => ["annotations", annotationId] as const,
};
