import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  privacyMode: boolean;
  toggleSidebar: () => void;
  togglePrivacyMode: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarOpen: true,
  privacyMode: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  togglePrivacyMode: () => set((s) => ({ privacyMode: !s.privacyMode })),
}));
