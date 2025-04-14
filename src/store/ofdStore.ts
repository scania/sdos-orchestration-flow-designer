import { create } from 'zustand';

interface Edge {
  id: string;
}

interface Node {
  id: string;
  type: string;
}

// Define the store type for typescript linting
interface OfdStore {
  setupMode: boolean;
  setSetupMode: (value: boolean) => void;

  connectedEdgesFromNode: Edge[];
  addConnectedEdges: (edges: Edge | Edge[]) => void;
  clearConnectedEdges: () => void;

  selectedNode: Node | null;
  setSelectedNode: (node: Node | null) => void;

  isGraphEditable: boolean;
  setIsGraphEditable: (value: boolean) => void;
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

  selectedNode: null,
  setSelectedNode: (node) => set({ selectedNode: node }),

  isGraphEditable: false,
  setIsGraphEditable: (value) => set({ isGraphEditable: value }),
}));

export default useOfdStore;