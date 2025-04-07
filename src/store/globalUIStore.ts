import { create } from 'zustand';
import { ToastItem } from '@/components/Toast/Toast';

interface GlobalUIState {
  toasts: ToastItem[];
  addToast: (toast: ToastItem) => void;
  removeToast: (index: number) => void;
  clearToasts: () => void;
}

const useGlobalUIStore = create<GlobalUIState>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({ toasts: [...state.toasts, toast] })),
  removeToast: (index) =>
    set((state) => ({
      toasts: state.toasts.filter((_, i) => i !== index),
    })),
  clearToasts: () => set({ toasts: [] }),
}));

export default useGlobalUIStore;
