import React, { useEffect, useRef } from "react";
import { TdsMessage } from "@scania/tegel-react";

export interface ToastItem {
  variant: "success" | "error" | "information" | "warning";
  header: string;
  description: string;
  timeout?: number;
  onShowMore?: (toast: ToastItem) => void;
}

interface ToastProps {
  listOfToasts: ToastItem[];
  setListOfToasts: React.Dispatch<React.SetStateAction<ToastItem[]>>;
}

const Toast: React.FC<ToastProps> = ({ listOfToasts, setListOfToasts }) => {
  const timersRef = useRef<(NodeJS.Timeout | null)[]>([]);

  useEffect(() => {
    timersRef.current.forEach((timer) => {
      if (timer) clearTimeout(timer);
    });

    timersRef.current = listOfToasts.map((toast, index) => {
      const toastTimeout = toast.timeout ?? 5000;
      return setTimeout(() => {
        removeToast(index);
      }, toastTimeout);
    });

    return () => {
      timersRef.current.forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [listOfToasts, setListOfToasts]);

  const removeToast = (index: number) => {
    setListOfToasts((prevToasts) => prevToasts.filter((_, i) => i !== index));
  };

  const handleMouseEnter = (index: number) => {
    //Pause the timer by clearing it
    if (timersRef.current[index]) {
      clearTimeout(timersRef.current[index]!);
      timersRef.current[index] = null;
    }
  };

  const handleMouseLeave = (index: number) => {
    // Reset the timeout completely from the start
    const toast = listOfToasts[index];
    if (!toast) return;
    const toastTimeout = toast.timeout ?? 5000;
    timersRef.current[index] = setTimeout(() => {
      removeToast(index);
    }, toastTimeout);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "32px",
        right: "10px",
        zIndex: 1000,
        width: "400px",
      }}
    >
      {listOfToasts.map((toast, i) => (
        <TdsMessage
          key={i}
          variant={toast.variant || "information"}
          header={toast.header}
          minimal={false}
          mode-variant="primary"
          no-icon={false}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={() => handleMouseLeave(i)}
        >
          <div>{toast.description}</div>
          {toast.onShowMore && (
            <div
              style={{ cursor: "pointer", margin: "10px 0px" }}
              onClick={() => toast.onShowMore?.(toast)}
            >
              Show more
            </div>
          )}
        </TdsMessage>
      ))}
    </div>
  );
};

export default Toast;
