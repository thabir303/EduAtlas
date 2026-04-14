import { create } from "zustand";

interface AdminUiState {
  selectedCategoryId: number | null;
  selectedSubcategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;
  setSelectedSubcategoryId: (id: number | null) => void;
  resetFilters: () => void;
}

export const useAdminUiStore = create<AdminUiState>((set) => ({
  selectedCategoryId: null,
  selectedSubcategoryId: null,
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  setSelectedSubcategoryId: (id) => set({ selectedSubcategoryId: id }),
  resetFilters: () => set({ selectedCategoryId: null, selectedSubcategoryId: null }),
}));
