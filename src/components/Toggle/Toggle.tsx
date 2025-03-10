import React from "react";
import styles from "./Toggle.module.scss"; // Import CSS Module

interface ToggleProps {
  isOn: boolean;
  onToggle: () => void;
}

const Toggle: React.FC<ToggleProps> = ({ isOn, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`${styles.toggle} ${isOn ? styles.toggle__on : ""}`}
      aria-pressed={isOn}
    >
      <div className={`${styles.toggle__thumb} ${isOn ? styles.toggle__thumb__on : ""}`} />
    </button>
  );
};

export default Toggle;
