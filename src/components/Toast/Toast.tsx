import React, { useEffect } from "react";

export interface ToastItem {
  variant: undefined | "success" | "error" | "information" | "warning";
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
  timeout,
}) => {
  useEffect(() => {
    const interval = setInterval(() => {
      if (listOfToasts.length) {
        setListOfToasts([]);
      }
    }, timeout || 5000);

    return () => {
      clearInterval(interval);
    };
  }, [listOfToasts, setListOfToasts, timeout]);

  return (
    <div style={{ position: "fixed", bottom: "32px", right: "10px" }}>
      {listOfToasts.map((toast, i) => (
        <tds-toast
          key={i}
          variant={toast.variant}
          header={toast.header}
          subheader={toast.description}
        />
      ))}
    </div>
  );
};

export default Toast;
