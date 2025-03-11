import React from "react";
import styles from "./Spinner.module.scss";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

const Spinner: React.FC<SpinnerProps> = ({ size = "lg" }) => {
  return (
    <div className={styles.spinnerContainer}>
      <tds-spinner size={size}></tds-spinner>
    </div>
  );
};

export default Spinner;
