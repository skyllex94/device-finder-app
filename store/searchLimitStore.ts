import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
// Not Currently used - limiter for found devices

interface SearchLimitState {
  searchCount: number;
  incrementSearchCount: () => void;
  resetSearchCount: () => void;
}

export const useSearchLimitStore = create<SearchLimitState>()(
  persist(
    (set) => ({
      searchCount: 0,
      incrementSearchCount: () =>
        set((state) => ({ searchCount: state.searchCount + 1 })),
      resetSearchCount: () => set({ searchCount: 0 }),
    }),
    {
      name: "search-limit-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
