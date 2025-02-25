import { create } from 'zustand';

// Define the store type for typescript linting
interface OfdStore {
  setupMode: boolean;
  setSetupMode: (value: boolean) => void;
}

const useOfdStore = create<OfdStore>((set) => ({
  setupMode: false,
  setSetupMode: (value) => set({ setupMode: value })
}));

export default useOfdStore;