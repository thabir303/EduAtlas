"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { getAnnotationByUUID } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { InlineAnnotation } from "@/lib/types";

export function useAnnotation() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const fetchAnnotation = useCallback(async (annotationId: string): Promise<InlineAnnotation | null> => {
    setLoading(true);
    try {
      const data = await queryClient.fetchQuery({
        queryKey: queryKeys.annotation(annotationId),
        queryFn: async () => {
          const response = await getAnnotationByUUID(annotationId);
          return response.data;
        },
        staleTime: 10 * 60 * 1000,
      });
      return data;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, [queryClient]);

  return { loading, fetchAnnotation };
}
