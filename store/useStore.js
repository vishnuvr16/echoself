'use client';

import { create } from 'zustand';

const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  
  voiceRecording: false,
  setVoiceRecording: (recording) => set({ voiceRecording: recording }),
  
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}));

export default useStore;
