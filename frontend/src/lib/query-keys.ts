export const queryKeys = {
  categories: ["categories"] as const,
  categoriesPage: (page: number) => ["categories", "page", page] as const,
  category: (slug: string) => ["categories", slug] as const,
  subjects: ["subjects"] as const,
  subjectsPage: (page: number, filters?: string) => ["subjects", "page", page, filters || "all"] as const,
  subject: (slug: string) => ["subjects", slug] as const,
  mediaAssets: ["media-assets"] as const,
  mediaAssetsPage: (page: number) => ["media-assets", "page", page] as const,
  annotation: (annotationId: string) => ["annotations", annotationId] as const,
};
