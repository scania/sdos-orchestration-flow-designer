import React, { useEffect } from "react";
import { TdsMessage } from "@scania/tegel-react";

export interface ToastItem {
  variant: "success" | "error" | "information" | "warning";
  header: string;
  description: string;
  timeout?: number;
  onShowMore?: Function
}

interface ToastProps {
  listOfToasts: ToastItem[];
  setListOfToasts: React.Dispatch<React.SetStateAction<ToastItem[]>>;
}

const Toast: React.FC<ToastProps> = ({ listOfToasts, setListOfToasts }) => {
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    listOfToasts.forEach((toast, index) => {
      const toastTimeout = toast.timeout ?? 5000; // Default timeout if not specified
      const timer = setTimeout(() => {
        setListOfToasts((prevToasts) =>
          prevToasts.filter((_, i) => i !== index)
        );
      }, toastTimeout);

      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout); // Clear all timers on cleanup
    };
  }, [listOfToasts, setListOfToasts]);

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
          {toast.onShowMore && <div style={{cursor: 'pointer', margin: '10px 0px'}} onClick={() => toast.onShowMore(toast)}>Show more</div>}
        </TdsMessage>
      ))}
    </div>
  );
};

export default Toast;
