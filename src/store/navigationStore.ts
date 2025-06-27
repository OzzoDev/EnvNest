import { create } from "zustand";

type NavigationState = {
  isNavigating: boolean;
  startNavigation: () => void;
  finishNavigation: () => void;
};

export const useNavigationStore = create<NavigationState>((set) => ({
  isNavigating: false,
  startNavigation: () => set({ isNavigating: true }),
  finishNavigation: () => set({ isNavigating: false }),
}));
