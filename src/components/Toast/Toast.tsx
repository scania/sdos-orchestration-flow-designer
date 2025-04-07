// components/Toast/Toast.tsx

import React, { useEffect, useRef } from "react";
import { TdsMessage } from "@scania/tegel-react";
import useGlobalUIStore  from "@/store/globalUIStore";
import styles from "./toast.module.scss";

export interface ToastItem {
  variant: "success" | "error" | "information" | "warning";
  header: string;
  description: string;
  timeout?: number;
  onShowMore?: (toast: ToastItem) => void;
}

const Toast: React.FC = () => {
  const listOfToasts = useGlobalUIStore ((state) => state.toasts);
  const removeToast = useGlobalUIStore ((state) => state.removeToast);
  const timersRef = useRef<(NodeJS.Timeout | null)[]>([]);

  useEffect(() => {
    timersRef.current.forEach((timer) => {
      if (timer) clearTimeout(timer);
    });

    timersRef.current = listOfToasts.map((toast, index) => {
      const timeout = toast.timeout ?? 5000;
      return setTimeout(() => removeToast(index), timeout);
    });

    return () => {
      timersRef.current.forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [listOfToasts]);

  const handleMouseEnter = (index: number) => {
    if (timersRef.current[index]) {
      clearTimeout(timersRef.current[index]!);
      timersRef.current[index] = null;
    }
  };

  const handleMouseLeave = (index: number) => {
    const toast = listOfToasts[index];
    if (!toast) return;
    const timeout = toast.timeout ?? 5000;
    timersRef.current[index] = setTimeout(() => {
      removeToast(index);
    }, timeout);
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
