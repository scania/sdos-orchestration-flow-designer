import React, { useEffect } from "react";
import { TdsMessage } from "@scania/tegel-react";

export interface ToastItem {
  variant: "success" | "error" | "information" | "warning";
  header: string;
  description: string;
}

interface ToastProps {
  listOfToasts: ToastItem[];
  setListOfToasts: React.Dispatch<React.SetStateAction<ToastItem[]>>;
  timeout?: number;
}

const Toast: React.FC<ToastProps> = ({
  listOfToasts,
  setListOfToasts,
  timeout = 5000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (listOfToasts.length) {
        setListOfToasts([]);
      }
    }, timeout);

    return () => {
      clearTimeout(timer);
    };
  }, [listOfToasts, setListOfToasts, timeout]);

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
        >
          <div>{toast.description}</div>
        </TdsMessage>
      ))}
    </div>
  );
};

export default Toast;
