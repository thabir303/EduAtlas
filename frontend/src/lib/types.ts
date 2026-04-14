export type MediaType = "text" | "image" | "audio" | "video" | "youtube";

export interface MediaAsset {
  id: number;
  title: string;
  media_type: MediaType;
  text_content?: string;
  file?: string;
  file_url?: string;
  youtube_url?: string;
  created_at: string;
  updated_at: string;
}

export type MarkType = "bold" | "italic" | "underline" | "highlight";

export interface TextNode {
  type: "text";
  text: string;
  marks?: MarkType[];
}

export interface AnnotatedNode {
  type: "annotated";
  text: string;
  annotation_id: string;
}

export type InlineNode = TextNode | AnnotatedNode;

export interface BodyNode {
  type: "paragraph";
  content: InlineNode[];
}

export interface ExpandableSection {
  id: number;
  title: string;
  body: string;
  order: number;
  is_default_open: boolean;
  content_block?: number;
}

export interface InlineAnnotation {
  id: number;
  term: string;
  annotation_id: string;
  media_asset: MediaAsset;
}

export interface ContentBlock {
  id: number;
  title: string;
  body: BodyNode[];
  expandable_sections: ExpandableSection[];
  annotations: InlineAnnotation[];
  updated_at: string;
}

export interface Subject {
  id: number;
  title: string;
  slug: string;
  description: string;
  subcategory_name: string;
  subcategory_slug: string;
  category_name: string;
  category_slug: string;
  content_block: ContentBlock | null;
  updated_at: string;
}

export interface SubjectListItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
  subcategory_name: string;
  subcategory_slug: string;
  category_name: string;
  category_slug: string;
}

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
  subjects: SubjectListItem[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
  subcategories: Subcategory[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
