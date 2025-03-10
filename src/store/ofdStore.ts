import { create } from 'zustand';

interface Edge {
  id: string;
}

// Define the store type for typescript linting
interface OfdStore {
  setupMode: boolean;
  setSetupMode: (value: boolean) => void;
  connectedEdgesFromNode: Edge[];
  addConnectedEdges: (edges: Edge | Edge[]) => void;
  clearConnectedEdges: () => void;
}

const useOfdStore = create<OfdStore>((set) => ({
  setupMode: false,
  setSetupMode: (value) => set({ setupMode: value }),

  connectedEdgesFromNode: [],
  addConnectedEdges: (edges) =>
    set((state) => ({
      connectedEdgesFromNode: [
        ...state.connectedEdgesFromNode,
        ...(Array.isArray(edges) ? edges : [edges]),
      ],
    })),
  clearConnectedEdges: () => set({ connectedEdgesFromNode: [] }),
}));

export default useOfdStore;