import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type ConnectionType = "bezier" | "step" | "smoothstep";

interface UserPreferencesStore {
  doubleClickToEnterSetupMode: boolean;
  connectionType: ConnectionType;

  // Actions
  setDoubleClickToEnterSetupMode: (enabled: boolean) => void;
  toggleDoubleClickToEnterSetupMode: () => void;

  setConnectionType: (type: ConnectionType) => void;

  resetOptions: () => void;
}

// Create the store
const userPreferencesStore = create<UserPreferencesStore>()(
  persist(
    (set) => ({
      // State
      doubleClickToEnterSetupMode: false, 
      connectionType: "bezier",

      // Actions
      setDoubleClickToEnterSetupMode: (enabled) =>
        set(() => ({ doubleClickToEnterSetupMode: enabled })),
      toggleDoubleClickToEnterSetupMode: () =>
        set((state) => ({ doubleClickToEnterSetupMode: !state.doubleClickToEnterSetupMode })),

      setConnectionType: (type) =>
        set(() => ({ connectionType: type })),

      resetOptions: () =>
        set(() => ({
          doubleClickToEnterSetupMode: false,
          connectionType: "bezier",
        })),
    }),
    {
      name: "options-storage", // Storage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default userPreferencesStore;
