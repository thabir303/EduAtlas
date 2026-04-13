import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./auth";
import type {
  AuthTokens,
  Category,
  ContentBlock,
  ExpandableSection,
  InlineAnnotation,
  MediaAsset,
  Subject,
  SubjectListItem,
} from "./types";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api: AxiosInstance = axios.create({
  baseURL,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        const refresh = getRefreshToken();
        if (!refresh) {
          throw new Error("No refresh token available");
        }

        const { data } = await axios.post<AuthTokens>(`${baseURL}/auth/token/refresh/`, { refresh });
        setTokens(data);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/admin/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export const login = (username: string, password: string) =>
  api.post<AuthTokens>("/auth/token/", { username, password });

export const getCategories = () => api.get<Category[]>("/categories/");
export const getCategory = (slug: string) => api.get<Category>(`/categories/${slug}/`);
export const getSubjects = () => api.get<SubjectListItem[]>("/subjects/");
export const getSubject = (slug: string) => api.get<Subject>(`/subjects/${slug}/`);
export const getAnnotationByUUID = (uuid: string) => api.get<InlineAnnotation>(`/annotations/${uuid}/`);

export const createCategory = (data: { name: string; description?: string }) => api.post("/categories/", data);
export const createSubcategory = (data: { name: string; category: number; description?: string }) =>
  api.post("/subcategories/", data);
export const createSubject = (data: { title: string; subcategory: number; description?: string }) =>
  api.post("/subjects/", data);

export const updateContentBlock = (id: number, data: Partial<ContentBlock>) => api.patch(`/content/${id}/`, data);

export const createContentBlock = (data: { subject_id: number; title: string; body?: ContentBlock["body"] }) =>
  api.post<ContentBlock>("/content/", data);

export const createInlineAnnotation = (data: { term: string; media_asset_id: number; content_block_id: number }) =>
  api.post<InlineAnnotation>("/inline-annotations/", data);

export const getMediaAssets = () => api.get<MediaAsset[]>("/media-assets/");
export const createMediaAsset = (formData: FormData) =>
  api.post<MediaAsset>("/media-assets/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteMediaAsset = (id: number) => api.delete(`/media-assets/${id}/`);

export const createExpandableSection = (data: {
  content_block: number;
  title: string;
  body: string;
  order?: number;
  is_default_open?: boolean;
}) => api.post<ExpandableSection>("/expandable-sections/", data);

export const updateExpandableSection = (
  id: number,
  data: Partial<Pick<ExpandableSection, "title" | "body" | "order" | "is_default_open">>,
) => api.patch<ExpandableSection>(`/expandable-sections/${id}/`, data);

export const deleteExpandableSection = (id: number) => api.delete(`/expandable-sections/${id}/`);

export default api;
