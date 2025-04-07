import useGlobalUIStore from "@/store/globalUIStore";

export const useToast = () => {
  const addToast = useGlobalUIStore((state) => state.addToast);
  const clearToasts = useGlobalUIStore((state) => state.clearToasts);

  return {
    showToast: (
      variant: "success" | "error" | "information" | "warning",
      header: string,
      description: string,
      timeout?: number,
      onShowMore?: (toast) => void
    ) => {
      addToast({ variant, header, description, timeout, onShowMore });
    },
    clearToasts
  };
};
