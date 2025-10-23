import React from "react";
import styles from "./Spinner.module.scss";
import { TdsSpinner } from "@scania/tegel-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

const Spinner: React.FC<SpinnerProps> = ({ size = "lg" }) => {
  return (
    <div className={styles.spinnerContainer}>
      <TdsSpinner size={size}></TdsSpinner>
    </div>
  );
};

export default Spinner;
