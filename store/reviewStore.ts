import { create } from "zustand";

interface ReviewState {
  shouldShowReview: boolean;
  setShouldShowReview: (show: boolean) => void;
}

export const useReviewStore = create<ReviewState>((set) => ({
  shouldShowReview: false,
  setShouldShowReview: (show) => set({ shouldShowReview: show }),
}));
