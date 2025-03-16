import React, { useState, useRef } from "react";
import styles from "./Tooltip.module.scss";

interface TooltipProps {
  content: React.ReactNode;
  delay?: number;
  direction?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  delay = 750,
  children,
  direction,
}) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [active, setActive] = useState(false);

  const showTip = () => {
    timeoutRef.current = setTimeout(() => {
      setActive(true);
    }, delay);
  };

  const hideTip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActive(false);
  };

  return (
    <div className={styles.wrapper} onMouseEnter={showTip} onMouseLeave={hideTip}>
      {children}
      {active && (
        <div
          className={`${styles.wrapper__tooltip} ${
            direction
              ? styles[`wrapper__tooltip__${direction}`]
              : styles.wrapper__tooltip__left
          }`}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
