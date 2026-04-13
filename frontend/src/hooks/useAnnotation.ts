"use client";

import { useCallback, useState } from "react";

import { getAnnotationByUUID } from "@/lib/api";
import type { InlineAnnotation } from "@/lib/types";

export function useAnnotation() {
  const [loading, setLoading] = useState(false);

  const fetchAnnotation = useCallback(async (annotationId: string): Promise<InlineAnnotation | null> => {
    setLoading(true);
    try {
      const { data } = await getAnnotationByUUID(annotationId);
      return data;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, fetchAnnotation };
}
