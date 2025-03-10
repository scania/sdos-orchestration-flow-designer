import React, { useEffect, useRef } from "react";
import { TdsMessage } from "@scania/tegel-react";
import styles from "./toast.module.scss";

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
    if (timersRef.current[index]) {
      clearTimeout(timersRef.current[index]!);
      timersRef.current[index] = null;
    }
  };

  const handleMouseLeave = (index: number) => {
    const toast = listOfToasts[index];
    if (!toast) return;
    const toastTimeout = toast.timeout ?? 5000;
    timersRef.current[index] = setTimeout(() => {
      removeToast(index);
    }, toastTimeout);
  };

  return (
    <div className={styles.container}>
      {listOfToasts.map((toast, i) => (
        <TdsMessage
          key={i}
          class={styles.toast}
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
              className={styles.showMore}
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
